// Shared resume data schema + validation. Used by the resume library
// (storage) and the per-resume editor (state) so both stay in sync.

export const TEMPLATES = ['modern', 'classic', 'minimal'];

// Open-source fonts (Google Fonts — SIL OFL / Apache 2.0) offered to the
// user. `id` is stored in the resume data; `css` is the font stack used
// for the live preview & HTML export. Category maps the choice to the
// 14 standard PDF fonts (sans → Helvetica family, serif → Times family).
export const FONTS = [
  { id: 'inter', name: 'Inter', css: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", category: 'sans' },
  { id: 'poppins', name: 'Poppins', css: "'Poppins', -apple-system, sans-serif", category: 'sans' },
  { id: 'roboto', name: 'Roboto', css: "'Roboto', -apple-system, sans-serif", category: 'sans' },
  { id: 'opensans', name: 'Open Sans', css: "'Open Sans', -apple-system, sans-serif", category: 'sans' },
  { id: 'lato', name: 'Lato', css: "'Lato', -apple-system, sans-serif", category: 'sans' },
  { id: 'sourcesans3', name: 'Source Sans 3', css: "'Source Sans 3', -apple-system, sans-serif", category: 'sans' },
  { id: 'ibmplexsans', name: 'IBM Plex Sans', css: "'IBM Plex Sans', -apple-system, sans-serif", category: 'sans' },
  { id: 'merriweather', name: 'Merriweather', css: "'Merriweather', Georgia, serif", category: 'serif' },
  { id: 'lora', name: 'Lora', css: "'Lora', Georgia, serif", category: 'serif' },
];

export const FONT_IDS = FONTS.map((f) => f.id);
export const FONT_DEFAULT = 'inter';

export function fontById(id) {
  return FONTS.find((f) => f.id === id) || FONTS[0];
}

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
  font: FONT_DEFAULT,
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
  if (!FONT_IDS.includes(merged.font)) merged.font = FONT_DEFAULT;
  return merged;
}
