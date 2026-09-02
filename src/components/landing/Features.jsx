import Icon from '../Icon.jsx';

const FEATURES = [
  {
    icon: 'lock',
    title: 'Private by Default',
    text: "All data stays in your browser's storage. Nothing is uploaded, tracked, or shared — close the tab and your work is waiting when you return.",
  },
  {
    icon: 'file-text',
    title: 'ATS-Friendly Every Time',
    text: 'Every export keeps a linear reading order, so automated resume scanners find your details in the same order you wrote them.',
  },
  {
    icon: 'layout-template',
    title: 'Three Distinct Styles',
    text: 'Modern, Classic, and Minimal templates restyle typography and spacing — never the underlying content or its structure.',
  },
  {
    icon: 'zap',
    title: 'Instant Live Preview',
    text: 'Watch the resume update as you type across every section and template, so the final file always matches what you see.',
  },
  {
    icon: 'pencil',
    title: 'Structured Simplicity',
    text: 'Dedicated tabs for profile, experience, education, projects, certifications, languages, and skills keep everything organized.',
  },
  {
    icon: 'globe',
    title: 'Zero Sign-Up',
    text: 'Jump straight in without an account. Edits auto-save to your browser, and you can pick up where you left off on the same device.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="section-label">Why Resuma</div>
      <div className="section-title">Everything you need, nothing you don&apos;t</div>
      <div className="section-sub">
        Fill in structured sections, watch the preview update, and export in a
        format that recruiters can actually read back.
      </div>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">
              <Icon name={f.icon} size={20} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

