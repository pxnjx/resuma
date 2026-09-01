import { describe, it, expect } from 'vitest';
import { buildPdf, textWidth, wrapText } from './pdf.js';
import { sampleResume } from '../data/sampleResume.js';

// Exact byte-preserving decode (TextDecoder('latin1') is a
// windows-1252 alias and would remap 0x80–0x9F, masking the
// WinAnsi bytes we intentionally emit).
const asText = (bytes) => {
  let s = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return s;
};

// Walk the xref table and verify every offset points at its object.
function parseXref(bytes) {
  const text = asText(bytes);
  const startxref = text.lastIndexOf('startxref');
  const xrefPos = parseInt(text.slice(startxref + 9).trim(), 10);
  if (text.slice(xrefPos, xrefPos + 4) !== 'xref') throw new Error('xref not at startxref offset');
  const m = text.slice(xrefPos).match(/^xref\n0 (\d+)\n/);
  const count = parseInt(m[1], 10);
  const entriesStart = xrefPos + m[0].length;
  const offsets = [];
  for (let i = 1; i < count; i += 1) {
    const entry = text.substr(entriesStart + i * 20, 20);
    offsets.push(parseInt(entry.slice(0, 10), 10));
  }
  return { text, count, offsets };
}

const EMPTY = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  summary: '',
  skills: '',
  skillsGrouped: '',
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  template: 'modern',
  accent: '',
};

describe('text measurement', () => {
  it('matches known Helvetica AFM widths', () => {
    // 'AAA' in Helvetica-Bold: 722 + 722 + 722 = 2166/1000 * 10pt
    expect(textWidth('AAA', 'bold', 10)).toBeCloseTo(21.66, 2);
    // ' ' is 278/1000 * 10pt
    expect(textWidth(' ', 'regular', 10)).toBeCloseTo(2.78, 2);
  });

  it('wraps long text to the given max width', () => {
    const lines = wrapText(
      'Frontend engineer with years of experience building applications',
      'regular',
      10,
      200
    );
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach((line) => expect(textWidth(line, 'regular', 10)).toBeLessThanOrEqual(200));
    expect(lines.join(' ')).toBe(
      'Frontend engineer with years of experience building applications'
    );
  });
});

describe('buildPdf', () => {
  it('produces a well-formed PDF envelope', () => {
    const pdf = asText(buildPdf(sampleResume));
    expect(pdf.startsWith('%PDF-1.4\n')).toBe(true);
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(pdf).toContain('/MediaBox [0 0 612 792]');
    expect(pdf).toContain('/BaseFont /Helvetica-Bold');
  });

  it('has a valid xref table — every offset points at its object', () => {
    const { text, count, offsets } = parseXref(buildPdf(sampleResume));
    expect(count).toBeGreaterThan(3);
    offsets.forEach((offset, i) => {
      expect(text.slice(offset, offset + `${i + 1} 0 obj`.length + 1)).toBe(`${i + 1} 0 obj\n`);
    });
  });

  it('renders the header and sections in ATS order', () => {
    const pdf = asText(buildPdf(sampleResume));
    expect(pdf).toContain('(Budi Santoso) Tj');
    expect(pdf).toContain('(Senior Frontend Engineer) Tj');
    const order = ['PROFESSIONAL SUMMARY', 'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS', 'LANGUAGES', 'SKILLS'];
    const indexes = order.map((h) => pdf.indexOf(`(${h}) Tj`));
    indexes.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
  });

  it('encodes bullets and dashes as WinAnsi bytes (single bytes, no multibyte)', () => {
    const pdf = asText(buildPdf(sampleResume));
    expect(pdf).toContain(String.fromCharCode(0x95)); // • (U+2022 → WinAnsi 0x95)
    expect(pdf).toContain(String.fromCharCode(0x96)); // – (en dash)
    expect(pdf).toContain(String.fromCharCode(0x97)); // — (em dash)
    expect(pdf).toContain(`${String.fromCharCode(0x95)} Led migration of a 200k-line codebase`);
    // No surrogate/UTF-8 sequence leaks into the byte stream.
    expect(pdf.includes('â\x80¢')).toBe(false); // "â\x80¢" would be the UTF-8 bytes of •
  });

  it('escapes PDF string special characters', () => {
    const pdf = asText(buildPdf({ ...EMPTY, name: 'A (B) C\\D' }));
    expect(pdf).toContain('(A \\(B\\) C\\\\D) Tj');
  });

  it('applies the accent color (or the default) to headings', () => {
    const fallback = asText(buildPdf({ ...EMPTY, skills: 'React, Node' }));
    expect(fallback).toContain('0.486 0.361 0.988 rg'); // #7c5cfc

    const custom = asText(buildPdf({ ...sampleResume, accent: '#12ab34' }));
    expect(custom).toContain('0.071 0.671 0.204 rg');
  });

  it('contains no timestamp or metadata dictionary', () => {
    const pdf = asText(buildPdf(sampleResume));
    expect(pdf).not.toContain('/CreationDate');
    expect(pdf).not.toContain('/Info');
  });

  it('stays single-page for empty data', () => {
    const pdf = asText(buildPdf(EMPTY));
    expect(pdf).toContain('(Your Name) Tj');
    expect(pdf).toContain('/Count 1');
  });

  it('spills onto multiple pages when content overflows', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      title: `Engineer #${i}`,
      company: 'Corp',
      start: 'Jan 2020',
      end: 'Dec 2021',
      desc: '• Built things that matter with a fairly long description line to fill the page faster\n• Another bullet to consume vertical space quickly here',
    }));
    const pdf = asText(buildPdf({ ...EMPTY, experience: many }));
    const pageMatches = pdf.match(/\/Type \/Page\b/g) || [];
    const declared = parseInt(pdf.match(/\/Count (\d+)/)[1], 10);
    expect(declared).toBeGreaterThan(1);
    expect(pageMatches.length).toBe(declared);
    // Kids array lists every page object.
    expect(pdf).toContain(`/Kids [${Array.from({ length: declared }, (_, i) => `${3 + i * 2} 0 R`).join(' ')}]`);
  });
});
