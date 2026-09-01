import { useCallback, useEffect, useRef, useState } from 'react';
import { useHashRoute, navigate } from './router.jsx';
import { useResumeLibrary } from './hooks/useResumeLibrary.js';
import Landing from './components/landing/Landing.jsx';
import PlatformLayout from './components/platform/PlatformLayout.jsx';
import Dashboard from './components/platform/Dashboard.jsx';
import TemplatesPage from './components/platform/TemplatesPage.jsx';
import BuilderPage from './components/builder/BuilderPage.jsx';
import Toast from './components/builder/Toast.jsx';

export default function App() {
  const route = useHashRoute();
  const { resumes, actions } = useResumeLibrary();
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2600);
  }, []);

  // Clear any pending toast timer when App unmounts.
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  // Scroll to top whenever the page changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const builderMatch = route.match(/^\/builder\/(.+)$/);

  const handleNew = useCallback(() => {
    const id = actions.createResume({}, 'Untitled Resume');
    navigate('/builder/' + id);
    showToast('✨ New resume created');
  }, [actions, showToast]);

  const handleCreateFromTemplate = useCallback(
    (templateId, templateName) => {
      const id = actions.createResume({ template: templateId }, 'Untitled Resume');
      navigate('/builder/' + id);
      showToast('✨ Resume created from the ' + templateName + ' template');
    },
    [actions, showToast]
  );

  const handleDuplicate = useCallback(
    (id) => {
      actions.duplicateResume(id);
      showToast('⧉ Resume duplicated');
    },
    [actions, showToast]
  );

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm('Delete this resume? This cannot be undone.')) {
        actions.deleteResume(id);
        showToast('🗑 Resume deleted');
        if (route.startsWith('/builder/')) navigate('/dashboard');
      }
    },
    [actions, showToast, route]
  );

  const handleResetData = useCallback(() => {
    if (window.confirm('Reset ALL data? Every saved resume will be replaced by the sample.')) {
      actions.resetLibrary();
      navigate('/dashboard');
      showToast('⚠ All data has been reset');
    }
  }, [actions, showToast]);

  const handleChangeData = useCallback(
    (id, data) => actions.updateResumeData(id, data),
    [actions]
  );

  const handleRename = useCallback((id, title) => actions.renameResume(id, title), [actions]);

  let page;
  if (route === '/' || route === '') {
    page = <Landing onCreateFromTemplate={handleCreateFromTemplate} />;
  } else if (route === '/dashboard' || route === '/templates') {
    page = (
      <PlatformLayout
        route={route}
        resumes={resumes}
        onNew={handleNew}
        onResetData={handleResetData}
      >
        {route === '/dashboard' ? (
          <Dashboard
            resumes={resumes}
            onNew={handleNew}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ) : (
          <TemplatesPage onCreate={handleCreateFromTemplate} />
        )}
      </PlatformLayout>
    );
  } else if (builderMatch) {
    const resume = resumes.find((r) => r.id === builderMatch[1]);
    if (resume) {
      page = (
        <BuilderPage
          key={resume.id}
          resume={resume}
          onChangeData={handleChangeData}
          onRename={handleRename}
          onDelete={handleDelete}
          showToast={showToast}
        />
      );
    } else {
      page = (
        <PlatformLayout
          route="/dashboard"
          resumes={resumes}
          onNew={handleNew}
          onResetData={handleResetData}
        >
          <div className="empty-state">
            <h3>Resume not found</h3>
            <p>It may have been deleted.</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </PlatformLayout>
      );
    }
  } else {
    page = <Landing onCreateFromTemplate={handleCreateFromTemplate} />;
  }

  return (
    <>
      {page}
      <Toast message={toastMessage} />
    </>
  );
}
