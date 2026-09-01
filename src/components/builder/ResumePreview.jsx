import { useRef, useState } from 'react';
import ResumePaper from './ResumePaper.jsx';
import AtsReadback from './AtsReadback.jsx';
import AtsChecklist from './AtsChecklist.jsx';
import { generateAtsText } from '../../utils/text.js';
import { exportDOCX, exportHTML, exportPDF, exportTXT } from '../../utils/exporters.js';

const TEMPLATES = [
  { id: 'modern', label: 'M', title: 'Modern' },
  { id: 'classic', label: 'C', title: 'Classic' },
  { id: 'minimal', label: 'N', title: 'Minimal' },
];

export default function ResumePreview({ data, actions, showToast }) {
  const paperRef = useRef(null);
  const [showAts, setShowAts] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const runExport = (fn, successMessage) => () => {
    try {
      fn();
      showToast(successMessage);
    } catch (err) {
      showToast('❌ ' + (err.message || 'Export failed'));
    }
  };

  return (
    <div className="preview-area">
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <div className="preview-dot red"></div>
          <div className="preview-dot yellow"></div>
          <div className="preview-dot green"></div>
          <span className="preview-label">Live Preview</span>
        </div>
        <div className="template-selector">
          <label>Template:</label>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.title}
              className={`tpl-btn${data.template === t.id ? ' active' : ''}`}
              onClick={() => actions.setTemplate(t.id)}
            >
              {t.label}
            </button>
          ))}
          <label className="accent-label">Accent:</label>
          <input
            type="color"
            className="accent-input"
            title="Accent color"
            value={data.accent || '#7c5cfc'}
            onChange={(e) => actions.setAccent(e.target.value)}
          />
          <button
            type="button"
            className="tpl-btn"
            title="Reset accent color"
            onClick={() => actions.setAccent('')}
          >
            ↺
          </button>
        </div>
      </div>

      <div className="export-bar">
        <button
          type="button"
          className="export-btn"
          onClick={runExport(() => exportTXT(data), '✅ Resume exported as .TXT')}
        >
          📄 .TXT
        </button>
        <button
          type="button"
          className="export-btn"
          onClick={runExport(
            () => exportPDF(data, paperRef.current),
            '✅ PDF print dialog opened — choose "Save as PDF"'
          )}
        >
          📑 .PDF
        </button>
        <button
          type="button"
          className="export-btn"
          onClick={runExport(() => exportDOCX(data, paperRef.current), '✅ Resume exported as .DOCX')}
        >
          📘 .DOCX
        </button>
        <button
          type="button"
          className="export-btn"
          onClick={runExport(() => exportHTML(data, paperRef.current), '✅ Resume exported as .HTML')}
        >
          🌐 .HTML
        </button>
        <button
          type="button"
          className={`export-btn${showAts ? ' toggle-on' : ''}`}
          onClick={() => setShowAts((v) => !v)}
        >
          👁 ATS Readback
        </button>
        <button
          type="button"
          className={`export-btn${showChecklist ? ' toggle-on' : ''}`}
          onClick={() => setShowChecklist((v) => !v)}
        >
          🎯 Readiness
        </button>
      </div>

      <ResumePaper ref={paperRef} data={data} template={data.template} />

      <AtsReadback open={showAts} text={generateAtsText(data)} />
      <AtsChecklist open={showChecklist} data={data} />
    </div>
  );
}

