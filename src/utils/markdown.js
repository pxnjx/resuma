// ─────────────────────────────────────────────────────────────
//  Markdown generation — derives directly from state (no DOM
//  walking), same philosophy as text.js. Section order mirrors
//  ResumePaper: Summary -> Experience -> Education -> Projects ->
//  Certifications -> Languages -> Skills.
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

function dateRange(start, end) {
  return [start, end].filter(Boolean).join(' – ');
}

// Free-text lines: bullet-prefixed lines become "- " list items,
// everything else stays as a plain paragraph line.
function descLines(desc) {
  return (desc || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => (/^[•\-*–—]\s+/.test(line) ? `- ${line.replace(/^[•\-*–—]\s+/, '')}` : line));
}

export function generateMarkdown(s) {
  const out = [];
  out.push(`# ${s.name || 'Your Name'}`);
  if (s.title) out.push('', `**${s.title}**`);
  const contact = contactPartsOf(s);
  if (contact.length) out.push('', contact.join(' | '));

  if (s.summary) {
    out.push('', '## Professional Summary', '', s.summary);
  }

  const experience = (s.experience || []).filter((e) => e.title || e.company);
  if (experience.length) {
    out.push('', '## Experience');
    experience.forEach((e) => {
      out.push('', `### ${[e.title, e.company].filter(Boolean).join(' | ')}`);
      const dates = dateRange(e.start, e.end);
      if (dates) out.push(`*${dates}*`);
      const desc = descLines(e.desc);
      if (desc.length) out.push('', ...desc);
    });
  }

  const education = (s.education || []).filter((e) => e.degree || e.school);
  if (education.length) {
    out.push('', '## Education');
    education.forEach((e) => {
      out.push('', `### ${[e.degree, e.school].filter(Boolean).join(' | ')}`);
      const dates = dateRange(e.start, e.end);
      if (dates) out.push(`*${dates}*`);
      const desc = descLines(e.desc);
      if (desc.length) out.push('', ...desc);
    });
  }

  const projects = (s.projects || []).filter((p) => p.name || p.link);
  if (projects.length) {
    out.push('', '## Projects');
    projects.forEach((p) => {
      out.push('', `### ${[p.name, p.link].filter(Boolean).join(' | ')}`);
      const desc = descLines(p.desc);
      if (desc.length) out.push(...desc);
    });
  }

  const certifications = (s.certifications || []).filter((e) => e.name || e.issuer);
  if (certifications.length) {
    out.push('', '## Certifications');
    certifications.forEach((c) => {
      const parts = [c.name, c.issuer, c.year].filter(Boolean);
      if (parts.length) out.push(`- ${parts.join(' | ')}`);
    });
  }

  const languages = (s.languages || []).filter((e) => e.name);
  if (languages.length) {
    out.push('', '## Languages');
    languages.forEach((l) => {
      out.push(`- ${l.level ? `${l.name} — ${l.level}` : l.name}`);
    });
  }

  const { groupedLines, flatSkills } = skillSetsOf(s);
  if (groupedLines.length || flatSkills.length) {
    out.push('', '## Skills');
    if (groupedLines.length) {
      groupedLines.forEach((l) => {
        const idx = l.indexOf(':');
        out.push(idx > 0 ? `**${l.slice(0, idx)}**:${l.slice(idx + 1)}` : l.trim());
      });
    } else {
      out.push(flatSkills.join(', '));
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}
