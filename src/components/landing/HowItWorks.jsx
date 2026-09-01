const STEPS = [
  {
    num: '01',
    title: 'Pick a template',
    text: 'Start from a template you like. Each one only changes typography, spacing, and accents — the structure underneath stays ATS-safe.',
    tags: ['Modern', 'Classic', 'Minimal'],
  },
  {
    num: '02',
    title: 'Type it once',
    text: "Fill structured sections: experience, education, skills. Every change lands in your browser's storage and nowhere else.",
    tags: ['Auto-save', 'LocalStorage'],
  },
  {
    num: '03',
    title: 'Survive the parser',
    text: "Download PDF, DOCX, or plain text, and any extractor reads it back in the order you wrote it. That's the whole trick.",
    tags: ['.pdf', '.docx', '.txt'],
  },
];

export default function HowItWorks() {
  return (
    <section className="steps" id="how-it-works">
      <div className="section-label">How it works</div>
      <div className="section-title">
        The same resume
        <br />
        at every stage
      </div>
      <div className="section-sub">
        What you type · What recruiters see · What the parser reads back
      </div>
      {STEPS.map((s) => (
        <div className="step" key={s.num}>
          <div className="step-num">{s.num}</div>
          <div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <div className="step-tags">
              {s.tags.map((t) => (
                <span className="tag" key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
