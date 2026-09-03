// ─────────────────────────────────────────────────────────────
//  Exporters: TXT / PDF / DOCX / HTML / MD / JSON — dependency-
//  free. PDF (pdf.js), DOCX (docx.js) & MD (markdown.js) are
//  generated directly from state; HTML reuses the exact same
//  template CSS the UI renders (imported with Vite's ?raw) so
//  it matches the on-screen preview.
// ─────────────────────────────────────────────────────────────
import resumeCss from '../styles/resume-templates.css?raw';
import { generatePlainText } from './text.js';
import { generateMarkdown } from './markdown.js';
import { buildDocx } from './docx.js';
import { buildPdf } from './pdf.js';
import { fontById } from '../data/schema.js';

export function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportTXT(state) {
  downloadFile(generatePlainText(state), 'resume.txt', 'text/plain');
}

// Build a standalone HTML document for printing (PDF) / HTML export.
function buildPrintDocument(state, paperEl) {
  const title = state.name || 'Resume';
  const fontDef = fontById(state.font);
  const fontFam = fontDef.name.replace(/ /g, '+');
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=${fontFam}:wght@400;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { background:#ffffff; }
  ${resumeCss}
  .resume-paper { box-shadow:none; margin:0; max-height:none; min-height:0; height:auto; overflow:visible; }
</style>
</head>
<body>${paperEl.outerHTML}</body>
</html>`;
}

// Direct PDF conversion — a real PDF file is generated from
// state (see pdf.js), so there is no print dialog and no
// browser-added header/footer (no timestamp, page title, or URL).
export function exportPDF(state) {
  downloadFile(buildPdf(state), 'resume.pdf', 'application/pdf');
}

// Genuine Office Open XML (.docx) — a ZIP package of
// WordprocessingML built from state (no HTML disguise), so Word,
// LibreOffice and Google Docs open it without a format warning
// and ATS parsers extract it reliably.
export function exportDOCX(state) {
  downloadFile(
    buildDocx(state),
    'resume.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}

// Standalone HTML export — opens in any browser, and its built-in
// print CSS means Ctrl+P prints only the resume paper.
export function exportHTML(state, paperEl) {
  if (!paperEl) throw new Error('Resume preview is not ready yet.');
  downloadFile(buildPrintDocument(state, paperEl), 'resume.html', 'text/html');
}

export function exportMarkdown(state) {
  downloadFile(generateMarkdown(state), 'resume.md', 'text/markdown');
}

export function exportJSON(state) {
  downloadFile(JSON.stringify(state, null, 2), 'resume.json', 'application/json');
}

// Parse + validate an imported JSON string (throws with a friendly message).
export function importResumeFromText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error('Invalid JSON file.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON root must be an object.');
  }
  return parsed;
}

