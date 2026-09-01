// Sample resume — loaded on the very first visit (when localStorage is empty)
// so the editor, preview, template gallery, and ATS readback are never blank.
export const sampleResume = {
  name: 'Budi Santoso',
  title: 'Senior Frontend Engineer',
  email: 'budi.santoso@example.com',
  phone: '+62 812 3456 7890',
  location: 'Jakarta, Indonesia',
  linkedin: 'linkedin.com/in/budisantoso',
  summary:
    'Frontend engineer with 7+ years of experience building large-scale web applications. Focused on performance, accessibility, and maintainable component architecture.',
  skills:
    'JavaScript, TypeScript, React, Next.js, Node.js, CSS, Tailwind, Jest, Figma',
  skillsGrouped:
    'Frontend: React, Next.js, TypeScript, Tailwind CSS\nBackend: Node.js, Express, PostgreSQL\nDevOps: Docker, CI/CD, AWS',
  experience: [
    {
      title: 'Senior Frontend Engineer',
      company: 'Acme Corp',
      start: 'Mar 2022',
      end: 'Present',
      desc: '• Led migration of a 200k-line codebase to a typed component library, cutting UI defects by 40%\n• Built a design system adopted by 5 product teams\n• Raised Lighthouse performance score from 62 to 96',
    },
    {
      title: 'Frontend Engineer',
      company: 'Techloop Studio',
      start: 'Jul 2019',
      end: 'Feb 2022',
      desc: '• Developed analytics dashboards with React & D3 used by 12k monthly users\n• Introduced unit and e2e testing culture, raising coverage from 20% to 85%',
    },
  ],
  education: [
    {
      degree: 'B.Sc. Computer Science',
      school: 'Universitas Indonesia',
      start: '2015',
      end: '2019',
      desc: 'Magna Cum Laude, GPA 3.8',
    },
  ],
  projects: [
    {
      name: 'Lanjut Resume Builder',
      link: 'github.com/budisantoso/lanjut',
      desc: '• Open-source, local-first ATS resume builder\n• React + Vite, zero backend — everything stays in the browser',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      year: '2024',
    },
  ],
  languages: [
    { name: 'Indonesian', level: 'Native' },
    { name: 'English', level: 'Professional' },
  ],
  template: 'modern',
  accent: '',
};
