// ─────────────────────────────────────────────────────────────
//  Text generation: plain-text export + ATS parser readback.
//  Both derive directly from state (no DOM walking), guaranteeing
//  "reading order intact" output.
//  Section order mirrors ResumePaper: Summary -> Experience ->
//  Education -> Projects -> Certifications -> Languages -> Skills.
// ─────────────────────────────────────────────────────────────

function contactPartsOf(s) {
  return [s.email, s.phone, s.location, s.linkedin].filter(Boolean);
}

function skillSetsOf(s) {
  const groupedLines = s.skillsGrouped
    ? s.skillsGrouped.split('\n').filter((l) => l.trim())
    : [];
  const flatSkills = s.skills
    ? s.skills.split(',').map((x) => x.trim()).filter(Boolean)
    : [];
  return { groupedLines, flatSkills };
}

export function generatePlainText(s) {
  let text = '';
  text += (s.name || 'Your Name') + '\n';
  if (s.title) text += s.title + '\n';
  const contact = contactPartsOf(s);
  if (contact.length) text += contact.join(' | ') + '\n';
  text += '\n';

  if (s.summary) {
    text += 'PROFESSIONAL SUMMARY\n' + '-'.repeat(40) + '\n' + s.summary + '\n\n';
  }

  const experience = (s.experience || []).filter((e) => e.title || e.company);
  if (experience.length) {
    text += 'EXPERIENCE\n' + '-'.repeat(40) + '\n';
    experience.forEach((e) => {
      const dates = [e.start, e.end].filter(Boolean).join(' – ');
      text += `${e.title}${e.company ? ' | ' + e.company : ''}\n${dates}\n`;
      if (e.desc) text += e.desc + '\n';
      text += '\n';
    });
  }

  const education = (s.education || []).filter((e) => e.degree || e.school);
  if (education.length) {
    text += 'EDUCATION\n' + '-'.repeat(40) + '\n';
    education.forEach((e) => {
      const dates = [e.start, e.end].filter(Boolean).join(' – ');
      text += `${e.degree}${e.school ? ' | ' + e.school : ''}\n${dates}\n`;
      if (e.desc) text += e.desc + '\n';
      text += '\n';
    });
  }

  const projects = (s.projects || []).filter((e) => e.name || e.link);
  if (projects.length) {
    text += 'PROJECTS\n' + '-'.repeat(40) + '\n';
    projects.forEach((p) => {
      text += `${p.name}${p.link ? ' | ' + p.link : ''}\n`;
      if (p.desc) text += p.desc + '\n';
      text += '\n';
    });
  }

  const certifications = (s.certifications || []).filter((e) => e.name || e.issuer);
  if (certifications.length) {
    text += 'CERTIFICATIONS\n' + '-'.repeat(40) + '\n';
    certifications.forEach((c) => {
      text += [c.name, c.issuer, c.year].filter(Boolean).join(' | ') + '\n';
    });
    text += '\n';
  }

  const languages = (s.languages || []).filter((e) => e.name);
  if (languages.length) {
    text += 'LANGUAGES\n' + '-'.repeat(40) + '\n';
    languages.forEach((l) => {
      text += (l.level ? `${l.name} — ${l.level}` : l.name) + '\n';
    });
    text += '\n';
  }

  const { groupedLines, flatSkills } = skillSetsOf(s);
  if (groupedLines.length || flatSkills.length) {
    text += 'SKILLS\n' + '-'.repeat(40) + '\n';
    if (groupedLines.length) {
      text += groupedLines.join('\n') + '\n\n';
    } else {
      text += flatSkills.join(', ') + '\n\n';
    }
  }

  return text.trimEnd() + '\n';
}

export function generateAtsText(s) {
  const lines = [];
  lines.push(s.name || 'Your Name');
  if (s.title) lines.push(s.title);
  const contact = contactPartsOf(s);
  if (contact.length) lines.push(contact.join(' · '));

  if (s.summary) {
    lines.push('PROFESSIONAL SUMMARY');
    s.summary.split('\n').filter((l) => l.trim()).forEach((l) => lines.push(l.trim()));
  }

  const experience = (s.experience || []).filter((e) => e.title || e.company);
  if (experience.length) {
    lines.push('EXPERIENCE');
    experience.forEach((e) => {
      lines.push([e.title, e.company].filter(Boolean).join(' · '));
      const dates = [e.start, e.end].filter(Boolean).join(' – ');
      if (dates) lines.push(dates);
      if (e.desc) {
        e.desc.split('\n').filter((l) => l.trim()).forEach((l) => lines.push(l.trim()));
      }
    });
  }

  const education = (s.education || []).filter((e) => e.degree || e.school);
  if (education.length) {
    lines.push('EDUCATION');
    education.forEach((e) => {
      lines.push([e.degree, e.school].filter(Boolean).join(' · '));
      const dates = [e.start, e.end].filter(Boolean).join(' – ');
      if (dates) lines.push(dates);
      if (e.desc) lines.push(e.desc.trim());
    });
  }

  const projects = (s.projects || []).filter((e) => e.name || e.link);
  if (projects.length) {
    lines.push('PROJECTS');
    projects.forEach((p) => {
      lines.push([p.name, p.link].filter(Boolean).join(' · '));
      if (p.desc) {
        p.desc.split('\n').filter((l) => l.trim()).forEach((l) => lines.push(l.trim()));
      }
    });
  }

  const certifications = (s.certifications || []).filter((e) => e.name || e.issuer);
  if (certifications.length) {
    lines.push('CERTIFICATIONS');
    certifications.forEach((c) => {
      lines.push([c.name, c.issuer].filter(Boolean).join(' · '));
      if (c.year) lines.push(c.year);
    });
  }

  const languages = (s.languages || []).filter((e) => e.name);
  if (languages.length) {
    lines.push('LANGUAGES');
    languages.forEach((l) => lines.push(l.level ? `${l.name} — ${l.level}` : l.name));
  }

  const { groupedLines, flatSkills } = skillSetsOf(s);
  if (groupedLines.length || flatSkills.length) {
    lines.push('SKILLS');
    if (groupedLines.length) {
      groupedLines.forEach((l) => lines.push(l.trim()));
    } else {
      flatSkills.forEach((sk) => lines.push(sk));
    }
  }

  return lines.join('\n');
}
