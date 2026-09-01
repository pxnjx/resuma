import ResumePaper from '../builder/ResumePaper.jsx';
import { sampleResume } from '../../data/sampleResume.js';

const TEMPLATE_CARDS = [
  { id: 'modern', name: 'Modern', desc: 'Bold accents, clean layout' },
  { id: 'classic', name: 'Classic', desc: 'Traditional, professional' },
  { id: 'minimal', name: 'Minimal', desc: 'Clean, lots of whitespace' },
];

// Browse Template page — picking one creates a new resume with that
// template and opens it in the builder.
export default function TemplatesPage({ onCreate }) {
  return (
    <div>
      <div className="dash-header">
        <div>
          <div className="section-label">Browse Template</div>
          <div className="dash-title">Pick your style</div>
        </div>
      </div>
      <p className="tpl-page-sub">
        Each template keeps the same ATS-safe structure — only typography,
        spacing, and accents change. Pick one to start a new resume.
      </p>
      <div className="tpl-page-grid">
        {TEMPLATE_CARDS.map((t) => (
          <div className="gallery-card tpl-page-card" key={t.id}>
            <div className="gallery-card-preview">
              <ResumePaper data={sampleResume} template={t.id} mini />
            </div>
            <div className="gallery-card-info">
              <h4>{t.name}</h4>
              <p>{t.desc}</p>
              <button
                type="button"
                className="btn-primary tpl-use-btn"
                onClick={() => onCreate(t.id, t.name)}
              >
                Use This Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
