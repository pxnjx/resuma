import { useRef } from 'react';
import { Link } from '../../router.jsx';
import { useResumeEditor } from '../../hooks/useResumeEditor.js';
import { exportJSON, importResumeFromText } from '../../utils/exporters.js';
import EditorTabs from './EditorTabs.jsx';
import ResumePreview from './ResumePreview.jsx';

// The resume builder on its own page (#/builder/:id). Edits are saved
// to the library on every change (local-first, like the prototype).
export default function BuilderPage({ resume, onChangeData, onRename, onDelete, showToast }) {
  const editor = useResumeEditor(resume, onChangeData);
  const fileInputRef = useRef(null);

  function handleExportJSON() {
    try {
      exportJSON(editor.data);
      showToast('✅ Data exported as .JSON');
    } catch (err) {
      showToast('❌ ' + (err.message || 'Export failed'));
    }
  }

  function handleImportClick() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        editor.actions.importState(importResumeFromText(reader.result));
        showToast('✅ Resume imported from JSON');
      } catch (err) {
        showToast('❌ ' + (err.message || 'Import failed'));
      }
    };
    reader.onerror = () => showToast('❌ Failed to read file');
    reader.readAsText(file);
  }

  function handleClearAll() {
    if (window.confirm('Clear all fields of this resume? This cannot be undone.')) {
      editor.actions.clearAll();
      showToast('🧹 Fields cleared');
    }
  }

  function handleLoadSample() {
    editor.actions.loadSample();
    showToast('✨ Sample data loaded');
  }

  return (
    <div>
      <div className="builder-topbar">
        <Link to="/dashboard" className="builder-back">
          ← Dashboard
        </Link>
        <input
          className="builder-title-input"
          value={resume.title || ''}
          onChange={(e) => onRename(resume.id, e.target.value)}
          placeholder="Resume title"
          title="Rename this resume"
        />
        <span className="save-badge">✓ Auto-saved</span>
        <div className="builder-topbar-actions">
          <button type="button" className="export-btn" onClick={handleClearAll}>
            🧹 Clear Fields
          </button>
          <button type="button" className="export-btn" onClick={handleLoadSample}>
            ✨ Load Sample
          </button>
          <button type="button" className="export-btn" onClick={handleExportJSON}>
            ⬇ Export JSON
          </button>
          <button type="button" className="export-btn" onClick={handleImportClick}>
            ⬆ Import JSON
          </button>
          <button
            type="button"
            className="export-btn danger"
            title="Delete this resume"
            onClick={() => onDelete(resume.id)}
          >
            🗑 Delete
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <EditorTabs data={editor.data} actions={editor.actions} />
        <ResumePreview data={editor.data} actions={editor.actions} showToast={showToast} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />
    </div>
  );
}
