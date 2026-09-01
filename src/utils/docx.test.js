import { describe, it, expect } from 'vitest';
import { buildDocx } from './docx.js';
import { sampleResume } from '../data/sampleResume.js';
import { crc32 } from './zip.js';

const decoder = new TextDecoder();

// Walk the ZIP central directory and return { name: text-content }.
function unzipTexts(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (off) => view.getUint16(off, true);
  const u32 = (off) => view.getUint32(off, true);

  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (u32(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  const count = u16(eocd + 10);
  let p = u32(eocd + 16);
  const files = {};
  for (let i = 0; i < count; i += 1) {
    const crc = u32(p + 16);
    const size = u32(p + 24);
    const nameLen = u16(p + 28);
    const extraLen = u16(p + 30);
    const commentLen = u16(p + 32);
    const localOffset = u32(p + 42);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    const localNameLen = u16(localOffset + 26);
    const dataStart = localOffset + 30 + localNameLen;
    const data = bytes.subarray(dataStart, dataStart + size);
    expect(crc32(data)).toBe(crc); // integrity of the produced package
    files[name] = decoder.decode(data);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
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

describe('buildDocx', () => {
  it('produces binary content with the ZIP magic bytes', () => {
    const docx = buildDocx(sampleResume);
    expect(docx).toBeInstanceOf(Uint8Array);
    expect(docx[0]).toBe(0x50);
    expect(docx[1]).toBe(0x4b);
  });

  it('packages the required OOXML parts', () => {
    const files = unzipTexts(buildDocx(sampleResume));
    expect(Object.keys(files).sort()).toEqual([
      '[Content_Types].xml',
      '_rels/.rels',
      'docProps/app.xml',
      'docProps/core.xml',
      'word/document.xml',
    ]);
    expect(files['[Content_Types].xml']).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'
    );
    expect(files['_rels/.rels']).toContain('word/document.xml');
    expect(files['docProps/app.xml']).toContain('<Application>Resuma</Application>');
  });

  it('renders the header and all sections in ATS order', () => {
    const { 'word/document.xml': doc } = unzipTexts(buildDocx(sampleResume));
    expect(doc).toContain('Budi Santoso');
    expect(doc).toContain('Senior Frontend Engineer');
    const order = ['PROFESSIONAL SUMMARY', 'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS', 'LANGUAGES', 'SKILLS'];
    const indexes = order.map((h) => doc.indexOf(`>${h}<`));
    indexes.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
  });

  it('keeps bullet description lines intact', () => {
    const { 'word/document.xml': doc } = unzipTexts(buildDocx(sampleResume));
    expect(doc).toContain('• Led migration of a 200k-line codebase to a typed component library');
  });

  it('escapes XML special characters in user content', () => {
    const files = unzipTexts(
      buildDocx({
        ...EMPTY,
        name: 'A & B <Dev>',
        experience: [{ title: 'C++ & R&D', company: '', start: '', end: '', desc: '' }],
      })
    );
    const doc = files['word/document.xml'];
    expect(doc).toContain('A &amp; B &lt;Dev&gt;');
    expect(doc).toContain('C++ &amp; R&amp;D');
    expect(doc).not.toContain('<Dev>');
  });

  it('applies the accent color (or the default) to section headings', () => {
    const custom = unzipTexts(buildDocx({ ...sampleResume, accent: '#12ab34' }));
    expect(custom['word/document.xml']).toContain('12AB34');

    const fallback = unzipTexts(buildDocx({ ...EMPTY, skills: 'React, Node' }));
    expect(fallback['word/document.xml']).toContain('7C5CFC');
  });

  it('falls back to "Your Name" and stays valid for empty data', () => {
    const files = unzipTexts(buildDocx(EMPTY));
    const doc = files['word/document.xml'];
    expect(doc).toContain('Your Name');
    expect(doc).not.toContain('EXPERIENCE');
    expect(doc).toContain('<w:sectPr>');
    expect(files['docProps/core.xml']).toContain('<dc:title>Resume — Resume</dc:title>');
  });
});
