import { useEffect, useRef, useState } from 'react';
import ResumePaper from './ResumePaper.jsx';
import AtsReadback from './AtsReadback.jsx';
import AtsChecklist from './AtsChecklist.jsx';
import { generateAtsText } from '../../utils/text.js';
import {
  exportDOCX,
  exportHTML,
  exportJSON,
  exportMarkdown,
  exportPDF,
  exportTXT,
} from '../../utils/exporters.js';
import Icon from '../Icon.jsx';

const TEMPLATES = [
  { id: 'modern', label: 'M', title: 'Modern' },
  { id: 'classic', label: 'C', title: 'Classic' },
  { id: 'minimal', label: 'N', title: 'Minimal' },
];

export default function ResumePreview({
  data,
  actions,
  showToast,
  resumeTitle,
  onRename,
  onClearAll,
  onLoadSample,
  onImportJson,
  onDelete,
}) {
  const paperRef = useRef(null);
  const exportRef = useRef(null);
  const [showAts, setShowAts] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);

  // Close the export menu on outside click or Escape.
  useEffect(() => {
    if (!exportOpen) return;
    const onDocClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setExportOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [exportOpen]);

  // Full preview modal: Escape closes, body scroll locked while open.
  useEffect(() => {
    if (!fullPreview) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setFullPreview(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [fullPreview]);

  const doExport = (fn, successMessage) => () => {
    try {
      fn();
      showToast(successMessage);
    } catch (err) {
      showToast(err.message || 'Export failed', 'error');
    } finally {
      setExportOpen(false);
    }
  };

  return (
    <div className="preview-area">
      {/* Title + auto-saved status (moved down into the Live Preview section) */}
      <div className="preview-title-row">
        <input
          className="builder-title-input"
          value={resumeTitle}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Resume title"
          title="Rename this resume"
        />
        <span className="save-badge">
          <Icon name="check" size={13} />
          Auto-saved
        </span>
      </div>

      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
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
            <Icon name="rotate-ccw" size={14} />
          </button>
        </div>
      </div>

      <div className="export-bar">
        <div className="export-menu" ref={exportRef}>
          <button
            type="button"
            className={`export-menu-btn${exportOpen ? ' open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={exportOpen}
            onClick={() => setExportOpen((v) => !v)}
          >
            <Icon name="download" size={14} />
            Export
            <Icon name="chevron-down" size={14} className="em-chevron" />
          </button>
          {exportOpen && (
            <div className="export-menu-dropdown" role="menu">
              <button
                type="button"
                role="menuitem"
                className="export-menu-item"
                onClick={doExport(() => exportTXT(data), 'Resume exported as .TXT')}
              >
                <Icon name="file-text" size={15} className="em-icon" />
                <span className="em-text">
                  <span className="em-name">Plain Text (.txt)</span>
                  <span className="em-hint">Simple plain-text resume</span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="export-menu-item"
                onClick={doExport(() => exportPDF(data), 'Resume exported as .PDF')}
              >
                <Icon name="file-down" size={15} className="em-icon" />
                <span className="em-text">
                  <span className="em-name">PDF (.pdf)</span>
                  <span className="em-hint">Print-ready document</span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="export-menu-item"
                onClick={doExport(() => exportDOCX(data), 'Resume exported as .DOCX')}
              >
                <Icon name="file" size={15} className="em-icon" />
                <span className="em-text">
                  <span className="em-name">Word (.docx)</span>
                  <span className="em-hint">Microsoft Word / ATS-friendly</span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="export-menu-item"
                onClick={doExport(
                  () => exportHTML(data, paperRef.current),
                  'Resume exported as .HTML'
                )}
              >
                <Icon name="globe" size={15} className="em-icon" />
                <span className="em-text">
                  <span className="em-name">HTML (.html)</span>
                  <span className="em-hint">Standalone web page</span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="export-menu-item"
                onClick={doExport(() => exportMarkdown(data), 'Resume exported as .MD')}
              >
                <Icon name="file-code" size={15} className="em-icon" />
                <span className="em-text">
                  <span className="em-name">Markdown (.md)</span>
                  <span className="em-hint">Portable .md file</span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="export-menu-item"
                onClick={doExport(() => exportJSON(data), 'Resume exported as .JSON')}
              >
                <Icon name="file-check" size={15} className="em-icon" />
                <span className="em-text">
                  <span className="em-name">JSON (.json)</span>
                  <span className="em-hint">Data backup / transfer</span>
                </span>
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          className={`export-btn${showAts ? ' toggle-on' : ''}`}
          onClick={() => setShowAts((v) => !v)}
        >
          <Icon name="eye" size={14} />
          ATS Readback
        </button>
        <button
          type="button"
          className={`export-btn${showChecklist ? ' toggle-on' : ''}`}
          onClick={() => setShowChecklist((v) => !v)}
        >
          <Icon name="target" size={14} />
          Readiness
        </button>
      </div>

      {/* Resume actions (moved from the topbar into the Live Preview section) */}
      <div className="preview-actions">
        <button type="button" className="export-btn" onClick={onClearAll}>
          <Icon name="eraser" size={13} />
          Clear Fields
        </button>
        <button type="button" className="export-btn" onClick={onLoadSample}>
          <Icon name="sparkles" size={13} />
          Load Sample
        </button>
        <button type="button" className="export-btn" onClick={onImportJson}>
          <Icon name="upload" size={13} />
          Import JSON
        </button>
        <button
          type="button"
          className="export-btn danger"
          title="Delete this resume"
          onClick={onDelete}
        >
          <Icon name="trash-2" size={13} />
          Delete
        </button>
      </div>

      {/* Live thumbnail — card shape mirroring the template gallery (own class,
          deliberately NOT .gallery-card-preview, so dashboard CSS is untouched).
          Click / Enter opens the full-size preview modal. */}
      <div
        className="builder-preview-card"
        role="button"
        tabIndex={0}
        title="Open full preview"
        aria-label="Open full preview"
        onClick={() => setFullPreview(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFullPreview(true);
          }
        }}
      >
        <ResumePaper data={data} template={data.template} mini />
      </div>

      {/* Off-screen full-size paper: markup source for the HTML export */}
      <div className="export-paper-source" aria-hidden="true">
        <ResumePaper ref={paperRef} data={data} template={data.template} />
      </div>

      <AtsReadback open={showAts} text={generateAtsText(data)} />
      <AtsChecklist open={showChecklist} data={data} />

      {/* Full preview modal — the same paper rendered full-size.
          Separate render (no ref) so the HTML-export source stays untouched. */}
      {fullPreview && (
        <div
          className="preview-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Full resume preview"
          onClick={() => setFullPreview(false)}
        >
          <div className="preview-modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-bar">
              <span className="preview-modal-title">Full Preview · {data.template}</span>
              <button
                type="button"
                className="preview-modal-close"
                title="Close (Esc)"
                aria-label="Close full preview"
                onClick={() => setFullPreview(false)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="preview-modal-scroll">
              <ResumePaper data={data} template={data.template} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

