import { useRef } from 'react';
import { Link } from '../../router.jsx';
import { useResumeEditor } from '../../hooks/useResumeEditor.js';
import { importResumeFromText } from '../../utils/exporters.js';
import EditorTabs from './EditorTabs.jsx';
import ResumePreview from './ResumePreview.jsx';
import Icon from '../Icon.jsx';

// The resume builder on its own page (#/builder/:id). Edits are saved
// to the library on every change (local-first, like the prototype).
export default function BuilderPage({ resume, onChangeData, onRename, onDelete, showToast }) {
  const editor = useResumeEditor(resume, onChangeData);
  const fileInputRef = useRef(null);

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        editor.actions.importState(importResumeFromText(reader.result));
        showToast('Resume imported from JSON');
      } catch (err) {
        showToast(err.message || 'Import failed', 'error');
      }
    };
    reader.onerror = () => showToast('Failed to read file', 'error');
    reader.readAsText(file);
  }

  function handleClearAll() {
    if (window.confirm('Clear all fields of this resume? This cannot be undone.')) {
      editor.actions.clearAll();
      showToast('Fields cleared');
    }
  }

  function handleLoadSample() {
    editor.actions.loadSample();
    showToast('Sample data loaded');
  }

  return (
    <div>
      <div className="builder-topbar">
        <Link to="/dashboard" className="builder-back">
          <Icon name="arrow-left" size={14} />
          Dashboard
        </Link>
      </div>

      <div className="editor-layout">
        <EditorTabs data={editor.data} actions={editor.actions} />
        <ResumePreview
          data={editor.data}
          actions={editor.actions}
          showToast={showToast}
          resumeTitle={resume.title || ''}
          onRename={(v) => onRename(resume.id, v)}
          onClearAll={handleClearAll}
          onLoadSample={handleLoadSample}
          onImportJson={() => fileInputRef.current?.click()}
          onDelete={() => onDelete(resume.id)}
        />
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
