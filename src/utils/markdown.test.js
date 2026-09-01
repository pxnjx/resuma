import { describe, it, expect } from 'vitest';
import { generateMarkdown } from './markdown.js';
import { sampleResume } from '../data/sampleResume.js';

const EMPTY = {
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
};

describe('generateMarkdown', () => {
  it('starts with an H1 name and omits empty sections', () => {
    const md = generateMarkdown(EMPTY);
    expect(md.startsWith('# Your Name')).toBe(true);
    expect(md).not.toContain('## Experience');
    expect(md).not.toContain('## Education');
    expect(md).not.toContain('## Skills');
  });

  it('renders title bold and joins contact parts with pipes', () => {
    const md = generateMarkdown(sampleResume);
    expect(md).toContain('**Senior Frontend Engineer**');
    expect(md).toContain('budi.santoso@example.com | +62 812 3456 7890');
  });

  it('orders core sections Summary -> Experience -> Education -> Skills', () => {
    const md = generateMarkdown(sampleResume);
    const order = ['## Professional Summary', '## Experience', '## Education', '## Skills'];
    const indexes = order.map((h) => md.indexOf(h));
    indexes.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
  });

  it('uses H3 entry headings with dates in italics', () => {
    const md = generateMarkdown(sampleResume);
    expect(md).toContain('### Senior Frontend Engineer | Acme Corp');
    expect(md).toContain('*Mar 2022 – Present*');
  });

  it('converts bullet descriptions into markdown list items', () => {
    const md = generateMarkdown(sampleResume);
    expect(md).toContain(
      '- Led migration of a 200k-line codebase to a typed component library, cutting UI defects by 40%'
    );
    expect(md).not.toContain('• Led migration');
  });

  it('lists projects, certifications and languages', () => {
    const md = generateMarkdown(sampleResume);
    expect(md).toContain('### Resuma Resume Builder | github.com/budisantoso/resuma');
    expect(md).toContain('- AWS Certified Cloud Practitioner | Amazon Web Services | 2024');
    expect(md).toContain('- Indonesian — Native');
    expect(md).toContain('- English — Professional');
  });

  it('bolds grouped skill labels and falls back to flat skills', () => {
    const md = generateMarkdown(sampleResume);
    expect(md).toContain('**Frontend**: React, Next.js, TypeScript, Tailwind CSS');

    const flat = generateMarkdown({ ...sampleResume, skillsGrouped: '' });
    expect(flat).toContain('JavaScript, TypeScript, React');
  });
});
