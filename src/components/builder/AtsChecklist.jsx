// ATS Readiness meter — checks that every ATS-essential section
// is filled in, mirroring the "Land the interview" promise.
const CHECKS = [
  { id: 'name', label: 'Full name filled in', done: (s) => Boolean((s.name || '').trim()) },
  { id: 'title', label: 'Job title / tagline', done: (s) => Boolean((s.title || '').trim()) },
  {
    id: 'contact',
    label: 'Email or phone number',
    done: (s) => Boolean((s.email || '').trim() || (s.phone || '').trim()),
  },
  {
    id: 'links',
    label: 'Location or LinkedIn / website',
    done: (s) => Boolean((s.location || '').trim() || (s.linkedin || '').trim()),
  },
  {
    id: 'summary',
    label: 'Professional summary (± 2+ sentences)',
    done: (s) => (s.summary || '').trim().length >= 80,
  },
  {
    id: 'experience',
    label: 'At least one experience with description',
    done: (s) =>
      (s.experience || []).some((e) => (e.title || e.company) && (e.desc || '').trim()),
  },
  {
    id: 'education',
    label: 'Education entry',
    done: (s) => (s.education || []).some((e) => e.degree || e.school),
  },
  {
    id: 'skills',
    label: 'Skills listed (flat or grouped)',
    done: (s) => Boolean((s.skills || '').trim() || (s.skillsGrouped || '').trim()),
  },
];

export default function AtsChecklist({ open, data }) {
  const results = CHECKS.map((c) => ({
    id: c.id,
    label: c.label,
    pass: Boolean(c.done(data)),
  }));
  const passed = results.filter((r) => r.pass).length;
  const pct = Math.round((passed / results.length) * 100);

  return (
    <div className={`ats-readback ats-checklist${open ? ' show' : ''}`}>
      <h4>
        🎯 ATS Readiness — {passed}/{results.length} sections complete
      </h4>
      <div className="meter">
        <div className="meter-fill" style={{ width: pct + '%' }} />
      </div>
      <ul className="check-list">
        {results.map((r) => (
          <li key={r.id} className={`check-item${r.pass ? ' done' : ''}`}>
            <span className="check-icon">{r.pass ? '✓' : '○'}</span>
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
      {passed < results.length ? (
        <p className="check-hint">
          Fill the remaining sections to maximize your chances with applicant
          tracking systems.
        </p>
      ) : (
        <p className="check-hint ok">
          ✓ All set — your resume covers every ATS-essential section.
        </p>
      )}
    </div>
  );
}
