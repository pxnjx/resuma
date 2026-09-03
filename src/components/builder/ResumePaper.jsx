import { forwardRef } from 'react';
import { tintHex } from '../../utils/color.js';
import { fontById } from '../../data/schema.js';
import Icon from '../Icon.jsx';

const CONTACT_FIELDS = [
  { key: 'email', icon: 'mail' },
  { key: 'phone', icon: 'phone' },
  { key: 'location', icon: 'map-point' },
  { key: 'linkedin', icon: 'link' },
];

function parseSkills(s) {
  const groupedLines = s.skillsGrouped
    ? s.skillsGrouped.split('\n').filter((l) => l.trim())
    : [];
  const flatSkills = s.skills
    ? s.skills.split(',').map((x) => x.trim()).filter(Boolean)
    : [];
  return { groupedLines, flatSkills };
}

function EntryDate({ start, end }) {
  const dates = [start, end].filter(Boolean).join(' – ');
  if (!dates) return null;
  return <span className="entry-date">{dates}</span>;
}

function EntryHeader({ title, company, start, end }) {
  return (
    <div className="entry-header">
      <div>
        <span className="entry-title">{title}</span>
        {company ? (
          <>
            {' · '}
            <span className="entry-company">{company}</span>
          </>
        ) : null}
      </div>
      <EntryDate start={start} end={end} />
    </div>
  );
}

function Section({ title, titleStyle, children }) {
  return (
    <div className="resume-section">
      <div className="resume-section-title" style={titleStyle}>
        {title}
      </div>
      {children}
    </div>
  );
}

// Renders the full resume for a given template. Reused three times:
// live preview (full size) and template gallery (mini variant).
// Accent color (optional) is applied via inline styles — not CSS
// variables — so it survives PDF / DOCX / HTML exports.
const ResumePaper = forwardRef(function ResumePaper({ data, template, mini = false }, ref) {
  const s = data || {};
  const contact = CONTACT_FIELDS.filter((f) => s[f.key]).map((f) => ({
    icon: f.icon,
    text: s[f.key],
  }));
  const experience = (s.experience || []).filter((e) => e.title || e.company);
  const education = (s.education || []).filter((e) => e.degree || e.school);
  const projects = (s.projects || []).filter((e) => e.name || e.link);
  const certifications = (s.certifications || []).filter((e) => e.name || e.issuer);
  const languages = (s.languages || []).filter((e) => e.name);
  const { groupedLines, flatSkills } = parseSkills(s);
  const hasContent =
    Boolean(s.summary) ||
    experience.length > 0 ||
    education.length > 0 ||
    projects.length > 0 ||
    certifications.length > 0 ||
    languages.length > 0 ||
    groupedLines.length > 0 ||
    flatSkills.length > 0;

  const accent =
    typeof s.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(s.accent) ? s.accent : '';
  const fontDef = fontById(s.font);
  const fontStyle = { fontFamily: fontDef.css };
  const soft = accent ? tintHex(accent, 0.9) : '';
  const titleStyle = accent ? { borderBottomColor: accent } : undefined;
  const tagStyle = () => {
    if (!accent) return undefined;
    if (template === 'minimal') return { color: accent };
    if (template === 'classic') return { borderColor: accent };
    return { background: soft, color: accent };
  };

  return (
    <div
      ref={ref}
      className={`resume-paper tpl-${template}${mini ? ' paper-mini' : ''}`}
      style={fontStyle}
    >
      <h1 className="resume-name">{s.name || 'Your Name'}</h1>
      {s.title ? <div className="resume-tagline">{s.title}</div> : null}

      {contact.length > 0 && (
        <div className="contact-row">
          {contact.map((item, i) => (
            <span className="contact-item" key={i}>
              {!mini && <Icon name={item.icon} size={12} className="contact-icon" />}
              {item.text}
            </span>
          ))}
        </div>
      )}

      {s.summary && (
        <Section title="Professional Summary" titleStyle={titleStyle}>
          <div className="entry-desc">{s.summary}</div>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience" titleStyle={titleStyle}>
          {experience.map((e, i) => (
            <div className="resume-entry" key={i}>
              <EntryHeader title={e.title} company={e.company} start={e.start} end={e.end} />
              {e.desc ? <div className="entry-desc">{e.desc}</div> : null}
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education" titleStyle={titleStyle}>
          {education.map((e, i) => (
            <div className="resume-entry" key={i}>
              <EntryHeader title={e.degree} company={e.school} start={e.start} end={e.end} />
              {e.desc ? <div className="entry-desc">{e.desc}</div> : null}
            </div>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects" titleStyle={titleStyle}>
          {projects.map((p, i) => (
            <div className="resume-entry" key={i}>
              <EntryHeader title={p.name} company={p.link} />
              {p.desc ? <div className="entry-desc">{p.desc}</div> : null}
            </div>
          ))}
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications" titleStyle={titleStyle}>
          {certifications.map((c, i) => (
            <div className="resume-entry" key={i}>
              <EntryHeader title={c.name} company={c.issuer} start={c.year} />
            </div>
          ))}
        </Section>
      )}

      {languages.length > 0 && (
        <Section title="Languages" titleStyle={titleStyle}>
          <div className="skills-list">
            {languages.map((l, i) => (
              <span className="skill-tag" key={i} style={tagStyle(i)}>
                {l.level ? `${l.name} — ${l.level}` : l.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {(groupedLines.length > 0 || flatSkills.length > 0) && (
        <Section title="Skills" titleStyle={titleStyle}>
          {groupedLines.length > 0 ? (
            <div className="skills-grouped">
              {groupedLines.map((line, i) => {
                const idx = line.indexOf(':');
                if (idx > -1) {
                  const group = line.slice(0, idx).trim();
                  const items = line
                    .slice(idx + 1)
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean);
                  return (
                    <div className="skill-group" key={i}>
                      <strong>{group}: </strong>
                      {items.map((item, j) => (
                        <span className="skill-tag" key={j} style={tagStyle(j)}>{item}</span>
                      ))}
                    </div>
                  );
                }
                return (
                  <span className="skill-tag" key={i} style={tagStyle(i)}>{line.trim()}</span>
                );
              })}
            </div>
          ) : (
            <div className="skills-list">
              {flatSkills.map((sk, i) => (
                <span className="skill-tag" key={i} style={tagStyle(i)}>{sk}</span>
              ))}
            </div>
          )}
        </Section>
      )}

      {!hasContent && (
        <p className="resume-empty">
          Start filling in your details to see the resume come to life.
        </p>
      )}
    </div>
  );
});

export default ResumePaper;
