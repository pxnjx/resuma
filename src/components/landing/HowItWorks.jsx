const STEPS = [
  {
    num: '01',
    title: 'Choose a template',
    text: 'Start with Modern, Classic, or Minimal. Switching templates changes the look — never your content or its order.',
    tags: ['Modern', 'Classic', 'Minimal'],
  },
  {
    num: '02',
    title: 'Fill in the details',
    text: 'Use the structured tabs to enter your history. Every keystroke is saved automatically to your browser as you go.',
    tags: ['Auto-save', 'Your browser'],
  },
  {
    num: '03',
    title: 'Export & apply',
    text: 'Download PDF, DOCX, Markdown, or plain text and send it off — the file stays in a clean, logical order from top to bottom.',
    tags: ['.pdf', '.docx', '.md', '.txt'],
  },
];

export default function HowItWorks() {
  return (
    <section className="steps" id="how-it-works">
      <div className="section-label">How it works</div>
      <div className="section-title">
        Three steps to a
        <br />
        stronger resume
      </div>
      <div className="section-sub">
        Pick a style · Fill your details · Export with confidence
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
