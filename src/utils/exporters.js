// ─────────────────────────────────────────────────────────────
//  Exporters: TXT / PDF / DOCX / HTML / JSON — dependency-free.
//  PDF, DOCX & HTML reuse the exact same template CSS the UI
//  renders (imported with Vite's ?raw), so exports match the
//  on-screen preview.
// ─────────────────────────────────────────────────────────────
import resumeCss from '../styles/resume-templates.css?raw';
import { generatePlainText } from './text.js';

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

// Build a standalone HTML document for printing / DOCX / HTML export.
function buildPrintDocument(state, paperEl) {
  const title = state.name || 'Resume';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { background:#ffffff; }
  ${resumeCss}
  .resume-paper { box-shadow:none; margin:0; }
</style>
</head>
<body>${paperEl.outerHTML}</body>
</html>`;
}

export function exportPDF(state, paperEl) {
  if (!paperEl) throw new Error('Resume preview is not ready yet.');
  const win = window.open('', '_blank');
  if (!win) throw new Error('Popup blocked — allow popups to export PDF.');
  win.document.write(buildPrintDocument(state, paperEl));
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 400);
}

export function exportDOCX(state, paperEl) {
  if (!paperEl) throw new Error('Resume preview is not ready yet.');
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${state.name || 'Resume'}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
  body { font-family:'Segoe UI', Arial, sans-serif; color:#1a1a1a; }
  ${resumeCss}
  .resume-paper { box-shadow:none; margin:0; width:auto; min-height:auto; }
</style>
</head>
<body>${paperEl.outerHTML}</body>
</html>`;
  downloadFile(html, 'resume.doc', 'application/msword');
}

// Standalone HTML export — opens in any browser, and its built-in
// print CSS means Ctrl+P prints only the resume paper.
export function exportHTML(state, paperEl) {
  if (!paperEl) throw new Error('Resume preview is not ready yet.');
  downloadFile(buildPrintDocument(state, paperEl), 'resume.html', 'text/html');
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

