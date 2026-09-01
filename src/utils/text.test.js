import { describe, it, expect } from 'vitest';
import { generatePlainText, generateAtsText } from './text.js';
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

describe('generatePlainText', () => {
  it('falls back to "Your Name" and omits empty sections', () => {
    const text = generatePlainText(EMPTY);
    expect(text.startsWith('Your Name')).toBe(true);
    expect(text).not.toContain('EXPERIENCE');
    expect(text).not.toContain('EDUCATION');
    expect(text).not.toContain('PROJECTS');
    expect(text).not.toContain('SKILLS');
  });

  it('renders core sections in ATS-friendly order', () => {
    const text = generatePlainText(sampleResume);
    const order = ['PROFESSIONAL SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS'];
    const indexes = order.map((h) => text.indexOf(h));
    indexes.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
  });

  it('joins contact parts with pipes', () => {
    const text = generatePlainText(sampleResume);
    expect(text).toContain('budi.santoso@example.com | +62 812 3456 7890');
  });

  it('lists grouped skills line by line', () => {
    const text = generatePlainText(sampleResume);
    expect(text).toContain('Frontend: React, Next.js, TypeScript, Tailwind CSS');
  });

  it('falls back to flat skills when no groups are given', () => {
    const text = generatePlainText({ ...sampleResume, skillsGrouped: '' });
    expect(text).toContain('JavaScript, TypeScript, React');
  });

  it('includes projects, certifications and languages', () => {
    const text = generatePlainText({
      ...EMPTY,
      projects: [{ name: 'Kanban App', link: 'github.com/me/kanban', desc: 'React + FastAPI' }],
      certifications: [{ name: 'AWS CCP', issuer: 'Amazon', year: '2024' }],
      languages: [{ name: 'Indonesian', level: 'Native' }],
    });
    expect(text).toContain('PROJECTS');
    expect(text).toContain('Kanban App | github.com/me/kanban');
    expect(text).toContain('CERTIFICATIONS');
    expect(text).toContain('AWS CCP | Amazon | 2024');
    expect(text).toContain('LANGUAGES');
    expect(text).toContain('Indonesian — Native');
  });
});

describe('generateAtsText', () => {
  it('starts with the name (or placeholder)', () => {
    expect(generateAtsText(EMPTY)).toBe('Your Name');
    expect(
      generateAtsText(sampleResume).startsWith('Budi Santoso\nSenior Frontend Engineer')
    ).toBe(true);
  });

  it('keeps reading order intact', () => {
    const lines = generateAtsText(sampleResume).split('\n');
    expect(lines.indexOf('EXPERIENCE')).toBeLessThan(lines.indexOf('EDUCATION'));
    expect(lines.indexOf('EDUCATION')).toBeLessThan(lines.indexOf('SKILLS'));
  });

  it('keeps bullet descriptions as separate lines', () => {
    const lines = generateAtsText(sampleResume).split('\n');
    expect(lines).toContain(
      '• Led migration of a 200k-line codebase to a typed component library, cutting UI defects by 40%'
    );
  });

  it('renders certifications and languages', () => {
    const text = generateAtsText({
      ...EMPTY,
      certifications: [{ name: 'AWS CCP', issuer: 'Amazon', year: '2024' }],
      languages: [{ name: 'English', level: 'Professional' }],
    });
    expect(text).toContain('AWS CCP · Amazon\n2024');
    expect(text).toContain('English — Professional');
  });
});
