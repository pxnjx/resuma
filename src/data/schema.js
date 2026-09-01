// Shared resume data schema + validation. Used by the resume library
// (storage) and the per-resume editor (state) so both stay in sync.

export const TEMPLATES = ['modern', 'classic', 'minimal'];

export const LIST_KEYS = ['experience', 'education', 'projects', 'certifications', 'languages'];

export const EMPTY_RESUME = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  summary: '',
  skills: '',
  skillsGrouped: '',
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  template: 'modern',
  accent: '',
};

// Merge raw data over the empty shape, with basic sanitization so a
// hand-edited or foreign JSON file can never crash the app.
export function normalizeResume(raw) {
  const merged = { ...EMPTY_RESUME, ...(raw || {}) };
  LIST_KEYS.forEach((k) => {
    if (!Array.isArray(merged[k])) merged[k] = [];
  });
  if (!TEMPLATES.includes(merged.template)) merged.template = 'modern';
  if (merged.accent && !/^#[0-9a-fA-F]{6}$/.test(merged.accent)) merged.accent = '';
  return merged;
}
