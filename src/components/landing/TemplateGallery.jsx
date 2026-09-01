import ResumePaper from '../builder/ResumePaper.jsx';
import { sampleResume } from '../../data/sampleResume.js';

const TEMPLATES = [
  { id: 'modern', name: 'Modern', desc: 'Bold accents, clean layout' },
  { id: 'classic', name: 'Classic', desc: 'Traditional, professional' },
  { id: 'minimal', name: 'Minimal', desc: 'Clean, lots of whitespace' },
];

// Landing-page gallery — clicking a card immediately creates a new
// resume with that template and opens the builder.
export default function TemplateGallery({ onCreate }) {
  const pick = (t) => () => onCreate(t.id, t.name);

  return (
    <section className="gallery" id="templates">
      <div className="section-label">Templates</div>
      <div className="section-title">Pick your style</div>
      <div className="section-sub">
        Each template keeps the same ATS-safe structure — only typography,
        spacing, and accents change. Click one to start editing right away.
      </div>
      <div className="gallery-grid">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="gallery-card"
            role="button"
            tabIndex={0}
            aria-label={'Start a new resume with the ' + t.name + ' template'}
            onClick={pick(t)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCreate(t.id, t.name);
              }
            }}
          >
            <div className="gallery-card-preview">
              <ResumePaper data={sampleResume} template={t.id} mini />
            </div>
            <div className="gallery-card-info">
              <h4>{t.name}</h4>
              <p>{t.desc} — click to start</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

