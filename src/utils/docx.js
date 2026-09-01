// ─────────────────────────────────────────────────────────────
//  DOCX builder — produces a genuine Office Open XML document
//  (a ZIP package containing WordprocessingML), dependency-free.
//  Content is derived directly from state (no DOM walking), the
//  same philosophy as text.js, so the reading order stays
//  ATS-intact. Accent color is applied to section headings via
//  w:color so it survives the same way the preview shows it.
// ─────────────────────────────────────────────────────────────
import { createZip } from './zip.js';

const DEFAULT_ACCENT = '7C5CFC';
const TEXT_COLOR = '1A1A1A';
const MUTED_COLOR = '555555';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── WordprocessingML fragments ────────────────────────────────

// <w:r> — a text run. rPr children follow the CT_RPr schema order
// (b → i → color → sz → szCs) so Word validates the part.
function run(text, { bold = false, italic = false, size = 22, color = TEXT_COLOR } = {}) {
  const rPr = [
    bold ? '<w:b/>' : '',
    italic ? '<w:i/>' : '',
    `<w:color w:val="${color}"/>`,
    `<w:sz w:val="${size}"/>`,
    `<w:szCs w:val="${size}"/>`,
  ].join('');
  return `<w:r><w:rPr>${rPr}</w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

// <w:p> — a paragraph. pPr children follow the CT_PPr schema order
// (pBdr → spacing → ind → jc).
function para(runsXml, { before = 0, after = 80, border = '', indent = 0, align = '' } = {}) {
  const pBdr = border
    ? `<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="4" w:color="${border}"/></w:pBdr>`
    : '';
  const spacing = `<w:spacing w:before="${before}" w:after="${after}" w:line="276" w:lineRule="auto"/>`;
  const ind = indent ? `<w:ind w:left="${indent}"/>` : '';
  const jc = align ? `<w:jc w:val="${align}"/>` : '';
  return `<w:p><w:pPr>${pBdr}${spacing}${ind}${jc}</w:pPr>${runsXml}</w:p>`;
}

const isBulletLine = (line) => /^[•\-*–—]\s+/.test(line);
const stripBullet = (line) => line.replace(/^[•\-*–—]\s+/, '');

function dateRange(start, end) {
  return [start, end].filter(Boolean).join(' – ');
}

// ── Document body blocks ──────────────────────────────────────

function headerBlock(state) {
  const parts = [
    para(run(state.name || 'Your Name', { bold: true, size: 44, color: '111111' }), {
      after: 40,
      align: 'center',
    }),
  ];
  if (state.title) {
    parts.push(
      para(run(state.title, { size: 24, color: MUTED_COLOR }), { after: 40, align: 'center' })
    );
  }
  const contact = [state.email, state.phone, state.location, state.linkedin].filter(Boolean);
  if (contact.length) {
    parts.push(
      para(run(contact.join(' | '), { size: 20, color: MUTED_COLOR }), {
        after: 120,
        align: 'center',
      })
    );
  }
  return parts.join('');
}

function sectionHeading(text, accent) {
  return para(run(text, { bold: true, size: 24, color: accent }), {
    before: 240,
    after: 120,
    border: accent,
  });
}

// Free-text lines: bullet-prefixed lines become indented bullet
// paragraphs, everything else stays as plain body paragraphs.
function descParagraphs(desc) {
  return (desc || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) =>
      isBulletLine(line)
        ? para(run(`• ${stripBullet(line)}`), { after: 40, indent: 240 })
        : para(run(line), { after: 40 })
    )
    .join('');
}

function entryBlock(entries, accent, heading, titleOf, dateOf, descOf) {
  if (!entries.length) return '';
  const paras = [sectionHeading(heading, accent)];
  entries.forEach((e) => {
    paras.push(
      para(run(titleOf(e).title, { bold: true }) + (titleOf(e).rest ? run(` | ${titleOf(e).rest}`) : ''), {
        after: 20,
      })
    );
    const dates = dateOf(e);
    if (dates) paras.push(para(run(dates, { italic: true, color: MUTED_COLOR }), { after: 40 }));
    const desc = descParagraphs(descOf(e));
    if (desc) paras.push(desc);
  });
  return paras.join('');
}

function skillsBlock(state, accent) {
  const groupedLines = state.skillsGrouped
    ? state.skillsGrouped.split('\n').map((l) => l.trim()).filter(Boolean)
    : [];
  const flatSkills = state.skills
    ? state.skills.split(',').map((x) => x.trim()).filter(Boolean)
    : [];
  if (!groupedLines.length && !flatSkills.length) return '';
  const paras = [sectionHeading('SKILLS', accent)];
  if (groupedLines.length) {
    groupedLines.forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        paras.push(
          para(run(line.slice(0, idx + 1), { bold: true }) + run(line.slice(idx + 1)), { after: 40 })
        );
      } else {
        paras.push(para(run(line), { after: 40 }));
      }
    });
  } else {
    paras.push(para(run(flatSkills.join(', ')), { after: 40 }));
  }
  return paras.join('');
}

// ── OOXML package parts ───────────────────────────────────────

const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

function contentTypesXml() {
  return `${XML_DECL}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
}

function rootRelsXml() {
  return `${XML_DECL}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function corePropsXml(state) {
  const name = state.name || 'Resume';
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  return `${XML_DECL}
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${esc(name)} — Resume</dc:title>
<dc:creator>${esc(name)}</dc:creator>
<cp:lastModifiedBy>Resuma</cp:lastModifiedBy>
<cp:revision>1</cp:revision>
<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
</cp:coreProperties>`;
}

function appPropsXml() {
  return `${XML_DECL}
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
<Application>Resuma</Application>
</Properties>`;
}

function documentXml(state, accent) {
  const body = [
    headerBlock(state),
    state.summary
      ? sectionHeading('PROFESSIONAL SUMMARY', accent) + para(run(state.summary), { after: 80 })
      : '',
    entryBlock(
      (state.experience || []).filter((e) => e.title || e.company),
      accent,
      'EXPERIENCE',
      (e) => ({ title: e.title || '', rest: e.company || '' }),
      (e) => dateRange(e.start, e.end),
      (e) => e.desc
    ),
    entryBlock(
      (state.education || []).filter((e) => e.degree || e.school),
      accent,
      'EDUCATION',
      (e) => ({ title: e.degree || '', rest: e.school || '' }),
      (e) => dateRange(e.start, e.end),
      (e) => e.desc
    ),
    entryBlock(
      (state.projects || []).filter((p) => p.name || p.link),
      accent,
      'PROJECTS',
      (p) => ({ title: p.name || '', rest: p.link || '' }),
      () => '',
      (p) => p.desc
    ),
    entryBlock(
      (state.certifications || []).filter((c) => c.name || c.issuer),
      accent,
      'CERTIFICATIONS',
      (c) => ({ title: c.name || '', rest: [c.issuer, c.year].filter(Boolean).join(' | ') }),
      () => '',
      () => ''
    ),
    entryBlock(
      (state.languages || []).filter((l) => l.name),
      accent,
      'LANGUAGES',
      (l) => ({ title: l.level ? `${l.name} — ${l.level}` : l.name, rest: '' }),
      () => '',
      () => ''
    ),
    skillsBlock(state, accent),
  ].join('');
  // US Letter page (12240 × 15840 twips) with 0.5" margins.
  return `${XML_DECL}
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${body}
<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>
</w:body>
</w:document>`;
}

/**
 * Build the complete .docx package for a resume.
 * @param {object} state — resume data (same shape as EMPTY_RESUME)
 * @returns {Uint8Array} binary .docx content ready for download
 */
export function buildDocx(state) {
  const accentRaw = state.accent && /^#[0-9a-fA-F]{6}$/.test(state.accent) ? state.accent : '#7c5cfc';
  const accent = accentRaw.replace('#', '').toUpperCase();
  return createZip([
    { name: '[Content_Types].xml', data: contentTypesXml() },
    { name: '_rels/.rels', data: rootRelsXml() },
    { name: 'word/document.xml', data: documentXml(state, accent) },
    { name: 'docProps/core.xml', data: corePropsXml(state) },
    { name: 'docProps/app.xml', data: appPropsXml() },
  ]);
}
