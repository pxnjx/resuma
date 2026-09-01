const FEATURES = [
  {
    icon: '🔒',
    title: '100% Local-First',
    text: "Everything lives in your browser's localStorage. Your data never leaves your machine. No servers, no clouds, no tracking.",
  },
  {
    icon: '📄',
    title: 'ATS-Safe Exports',
    text: "PDF, DOCX, and plain text — every export reads back in the order you wrote it. That's the whole trick for surviving parsers.",
  },
  {
    icon: '🎨',
    title: 'Beautiful Templates',
    text: 'Pick from handcrafted templates. Each one changes only typography, spacing, and accents — the ATS-safe structure underneath stays intact.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Preview',
    text: 'See your resume update as you type. What you see is exactly what recruiters see — and what the parser reads back.',
  },
  {
    icon: '✏️',
    title: 'Fine-Grained Editor',
    text: 'Structured sections for experience, education, skills, and more. Every field is deliberate — no filler, no noise.',
  },
  {
    icon: '🌐',
    title: 'No Account Required',
    text: 'Open the page, start building. Your work auto-saves locally. Come back anytime from the same browser.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="section-label">Why Lanjut</div>
      <div className="section-title">A fine-grained editor</div>
      <div className="section-sub">
        Build your ATS-safe resume in a focused editor. No AI slop, no
        overwhelming features. Straight to the point, without wasting your time.
      </div>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
