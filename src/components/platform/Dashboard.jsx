import { Link, navigate } from '../../router.jsx';
import Icon from '../Icon.jsx';
import ResumePaper from '../builder/ResumePaper.jsx';
import ResumeMoreMenu from './ResumeMoreMenu.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

function formatRelative(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

// Dashboard page — "My Resume" card grid with live previews.
export default function Dashboard({ resumes, onNew, onDuplicate, onDelete, showToast, theme, onToggleTheme }) {
  return (
    <div>
      <div className="dash-header">
        <div>
          <div className="section-label">Dashboard</div>
          <div className="dash-title">My Resume</div>
        </div>
        <div className="dash-actions">
          <button type="button" className="btn-primary" onClick={onNew}>
            <Icon name="plus" size={15} />
            New Resume
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="empty-state">
          <h3>No resumes yet</h3>
          <p>Create your first resume — pick a template or start from scratch.</p>
          <button type="button" className="btn-primary" onClick={onNew}>
            <Icon name="plus" size={15} />
            Create Resume
          </button>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map((r) => (
            <div className="resume-card" key={r.id}>
              <Link to={'/builder/' + r.id} className="gallery-card-preview resume-card-preview" title="Open in editor">
                <ResumePaper data={r.data} template={r.data?.template || 'modern'} mini />
              </Link>
              <div className="resume-card-info">
                <Link to={'/builder/' + r.id} className="resume-card-title">
                  {r.title || 'Untitled Resume'}
                </Link>
                <div className="resume-card-meta">
                  {r.data?.name || 'No name yet'} · {r.data?.template || 'modern'} ·{' '}
                  {formatRelative(r.updatedAt)}
                </div>
                <div className="resume-card-actions">
                  <ResumeMoreMenu
                    resume={r}
                    onEdit={() => navigate('/builder/' + r.id)}
                    onDuplicate={() => onDuplicate(r.id)}
                    onDelete={() => onDelete(r.id)}
                    showToast={showToast}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

