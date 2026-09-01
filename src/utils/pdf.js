// ─────────────────────────────────────────────────────────────
//  PDF builder — generates a real PDF file directly from state,
//  dependency-free. No print dialog, no browser-added headers
//  (no timestamp / page title) — the output is identical on
//  every export. Uses the 14 standard PDF fonts (Helvetica
//  family, WinAnsiEncoding) so nothing needs embedding, plus
//  the AFM width tables for accurate wrapping and centering.
//  Content is derived from state (no DOM walking), mirroring
//  docx.js so both exports share the same ATS-safe structure.
// ─────────────────────────────────────────────────────────────

// US Letter in PDF points (1 pt = 1/72").
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;

const TEXT_COLOR = '0.102 0.102 0.102'; // #1a1a1a
const DARK_COLOR = '0.067 0.067 0.067'; // #111111
const MUTED_COLOR = '0.333 0.333 0.333'; // #555555

const FONT_KEYS = { regular: 'F1', bold: 'F2', italic: 'F3' };

// AFM character widths (units/1000) for char codes 32–126.
const HELV_REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const HELV_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

// Widths for common WinAnsi high bytes (everything else defaults).
const EXTRA_WIDTHS = { 133: 1000, 149: 350, 150: 556, 151: 1000 }; // … • – —

// Unicode → WinAnsi byte values (chars ≤ 0xFF already map 1:1).
const WIN_ANSI = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

// Map a JS string to a latin1-safe string (one byte per char).
function toWinAnsi(str) {
  let out = '';
  for (const ch of String(str ?? '')) {
    const code = ch.codePointAt(0);
    if (code <= 0xff) out += ch;
    else if (WIN_ANSI[code] != null) out += String.fromCharCode(WIN_ANSI[code]);
    else out += '?';
  }
  return out;
}

function charWidth(code, fontKey) {
  if (code >= 32 && code <= 126) {
    return (fontKey === 'bold' ? HELV_BOLD : HELV_REGULAR)[code - 32];
  }
  return EXTRA_WIDTHS[code] != null ? EXTRA_WIDTHS[code] : 556;
}

export function textWidth(str, fontKey, size) {
  const s = toWinAnsi(str);
  let total = 0;
  for (let i = 0; i < s.length; i += 1) total += charWidth(s.charCodeAt(i), fontKey);
  return (total / 1000) * size;
}

// Greedy word wrapping; words wider than maxWidth are hard-split.
export function wrapText(text, fontKey, size, maxWidth) {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    while (textWidth(word, fontKey, size) > maxWidth && word.length > 1) {
      let cut = word.length;
      while (cut > 1 && textWidth(word.slice(0, cut), fontKey, size) > maxWidth) cut -= 1;
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(word.slice(0, cut));
      word = word.slice(cut);
    }
    const candidate = line ? `${line} ${word}` : word;
    if (textWidth(candidate, fontKey, size) <= maxWidth) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

// ── Layout engine ─────────────────────────────────────────────

const fmt = (v) => String(Math.round(v * 100) / 100);

// Escape ( ) \ inside a PDF literal string.
function escPdf(str) {
  return toWinAnsi(str).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => String(Math.round((v / 255) * 1000) / 1000);
  return `${ch((n >> 16) & 255)} ${ch((n >> 8) & 255)} ${ch(n & 255)}`;
}

function layout(state, accent) {
  const ops = [];
  const pages = [];
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    pages.push(ops.join('\n'));
    ops.length = 0;
    y = PAGE_H - MARGIN;
  };
  const ensure = (needed) => {
    if (y - needed < MARGIN) newPage();
  };
  const finish = () => {
    if (ops.length || !pages.length) pages.push(ops.join('\n'));
  };

  // Draw one line of text at the current baseline (no wrapping).
  function draw(text, { font = 'regular', size = 10, color = TEXT_COLOR, x = MARGIN, align = 'left' } = {}) {
    const w = textWidth(text, font, size);
    const px = align === 'center' ? (PAGE_W - w) / 2 : align === 'right' ? PAGE_W - MARGIN - w : x;
    ops.push(
      `BT /${FONT_KEYS[font]} ${size} Tf ${color} rg 1 0 0 1 ${fmt(px)} ${fmt(y)} Tm (${escPdf(text)}) Tj ET`
    );
  }

  function rule(color) {
    ops.push(
      `${color} RG 0.8 w ${MARGIN} ${fmt(y - 4)} m ${PAGE_W - MARGIN} ${fmt(y - 4)} l S`
    );
  }

  // Wrapped paragraph; hanging indent keeps bullets aligned.
  function para(text, { font = 'regular', size = 10, color = TEXT_COLOR, lh = 13.5, indent = 0 } = {}) {
    wrapText(text, font, size, CONTENT_W - indent).forEach((line, i) => {
      ensure(lh);
      y -= lh;
      draw(line, { font, size, color, x: MARGIN + (i === 0 ? 0 : indent) });
    });
  }

  function centered(text, font, size, color, lh) {
    ensure(lh);
    y -= lh;
    draw(text, { font, size, color, align: 'center' });
  }

  function heading(text) {
    ensure(42); // keep the heading with at least its first line
    y -= 15;
    draw(text, { font: 'bold', size: 12, color: accent });
    rule(accent);
    y -= 21;
  }

  // Bold lead + regular remainder ("Title | Company").
  function entryTitle(title, rest) {
    ensure(14);
    y -= 14;
    draw(title, { font: 'bold', size: 10.5 });
    if (!rest) return;
    draw(` | ${rest}`, { font: 'regular', size: 10.5, x: MARGIN + textWidth(title, 'bold', 10.5) });
  }

  // "Label: value" with the label bolded and the value wrapped
  // with a hanging indent under it.
  function labeledLine(label, rest) {
    if (!rest) return para(label, { size: 10 });
    ensure(13.5);
    y -= 13.5;
    draw(label, { font: 'bold', size: 10 });
    const labelWidth = textWidth(label, 'bold', 10);
    wrapText(rest, 'regular', 10, CONTENT_W - labelWidth).forEach((line, i) => {
      if (i > 0) {
        ensure(13.5);
        y -= 13.5;
      }
      draw(line, { font: 'regular', size: 10, x: MARGIN + labelWidth });
    });
  }

  // Free-text block: bullet-prefixed lines become "• " items
  // with a hanging indent, everything else stays a paragraph.
  function descBlock(desc) {
    (desc || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        if (/^[•\-*–—]\s+/.test(line)) {
          para(`• ${line.replace(/^[•\-*–—]\s+/, '')}`, { indent: 12 });
        } else {
          para(line);
        }
      });
  }

  const dates = (a, b) => [a, b].filter(Boolean).join(' – ');

  // ── Header ──
  centered(state.name || 'Your Name', 'bold', 22, DARK_COLOR, 26);
  if (state.title) centered(state.title, 'regular', 12, MUTED_COLOR, 16);
  const contact = [state.email, state.phone, state.location, state.linkedin].filter(Boolean);
  if (contact.length) {
    centered(contact.join(' | '), 'regular', 9.5, MUTED_COLOR, 14);
    y -= 4;
  }

  // ── Sections (order mirrors ResumePaper) ──
  if (state.summary) {
    heading('PROFESSIONAL SUMMARY');
    para(state.summary);
  }

  const experience = (state.experience || []).filter((e) => e.title || e.company);
  if (experience.length) {
    heading('EXPERIENCE');
    experience.forEach((e) => {
      ensure(42);
      entryTitle(e.title || '', e.company || '');
      const d = dates(e.start, e.end);
      if (d) para(d, { font: 'italic', size: 9.5, color: MUTED_COLOR, lh: 13 });
      descBlock(e.desc);
    });
  }

  const education = (state.education || []).filter((e) => e.degree || e.school);
  if (education.length) {
    heading('EDUCATION');
    education.forEach((e) => {
      ensure(42);
      entryTitle(e.degree || '', e.school || '');
      const d = dates(e.start, e.end);
      if (d) para(d, { font: 'italic', size: 9.5, color: MUTED_COLOR, lh: 13 });
      descBlock(e.desc);
    });
  }

  const projects = (state.projects || []).filter((p) => p.name || p.link);
  if (projects.length) {
    heading('PROJECTS');
    projects.forEach((p) => {
      ensure(42);
      entryTitle(p.name || '', p.link || '');
      descBlock(p.desc);
    });
  }

  const certifications = (state.certifications || []).filter((c) => c.name || c.issuer);
  if (certifications.length) {
    heading('CERTIFICATIONS');
    certifications.forEach((c) => {
      ensure(28);
      entryTitle(c.name || '', [c.issuer, c.year].filter(Boolean).join(' | '));
    });
  }

  const languages = (state.languages || []).filter((l) => l.name);
  if (languages.length) {
    heading('LANGUAGES');
    languages.forEach((l) => para(l.level ? `${l.name} — ${l.level}` : l.name));
  }

  const groupedLines = state.skillsGrouped
    ? state.skillsGrouped.split('\n').map((l) => l.trim()).filter(Boolean)
    : [];
  const flatSkills = state.skills
    ? state.skills.split(',').map((x) => x.trim()).filter(Boolean)
    : [];
  if (groupedLines.length || flatSkills.length) {
    heading('SKILLS');
    if (groupedLines.length) {
      groupedLines.forEach((line) => {
        const idx = line.indexOf(':');
        if (idx > 0) labeledLine(`${line.slice(0, idx)}:`, line.slice(idx + 1).trim());
        else para(line);
      });
    } else {
      para(flatSkills.join(', '));
    }
  }

  finish();
  return pages;
}

// ── PDF assembly ──────────────────────────────────────────────

function latin1ToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i += 1) bytes[i] = str.charCodeAt(i) & 0xff;
  return bytes;
}

/**
 * Build the complete PDF for a resume.
 * @param {object} state — resume data (same shape as EMPTY_RESUME)
 * @returns {Uint8Array} binary PDF content ready for download
 */
export function buildPdf(state) {
  const accentHex = state.accent && /^#[0-9a-fA-F]{6}$/.test(state.accent) ? state.accent : '#7c5cfc';
  const accent = hexToRgb(accentHex);
  const pageContents = layout(state, accent);
  const pageCount = pageContents.length;

  // Object numbering: 1 catalog, 2 pages tree, then per page a
  // page object + content stream object, then the 3 fonts.
  const fontStart = 3 + pageCount * 2;
  const objects = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  const kids = Array.from({ length: pageCount }, (_, i) => `${3 + i * 2} 0 R`).join(' ');
  objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`);
  pageContents.forEach((content, i) => {
    const pageObjNum = 3 + i * 2;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontStart} 0 R /F2 ${fontStart + 1} 0 R /F3 ${fontStart + 2} 0 R >> >> /Contents ${pageObjNum + 1} 0 R >>`
    );
    // No /Info dictionary and no /CreationDate — every export of
    // the same resume produces byte-identical, timestamp-free PDFs.
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');

  let out = '%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefPos = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    out += `${String(o).padStart(10, '0')} 00000 n \n`;
  });
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return latin1ToBytes(out);
}
