import { useState } from 'react';
import ProfileTab from './ProfileTab.jsx';
import ExperienceTab from './ExperienceTab.jsx';
import EducationTab from './EducationTab.jsx';
import ProjectsTab from './ProjectsTab.jsx';
import CertificationsTab from './CertificationsTab.jsx';
import LanguagesTab from './LanguagesTab.jsx';
import SkillsTab from './SkillsTab.jsx';
import SummaryTab from './SummaryTab.jsx';
import ScrollStrip from './ScrollStrip.jsx';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'exp', label: 'Experience' },
  { id: 'edu', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'certs', label: 'Certificates' },
  { id: 'langs', label: 'Languages' },
  { id: 'skills', label: 'Skills' },
  { id: 'summary', label: 'Summary' },
];

const PANELS = {
  profile: ProfileTab,
  exp: ExperienceTab,
  edu: EducationTab,
  projects: ProjectsTab,
  certs: CertificationsTab,
  langs: LanguagesTab,
  skills: SkillsTab,
  summary: SummaryTab,
};

export default function EditorTabs({ data, actions }) {
  const [active, setActive] = useState('profile');

  return (
    <div className="editor-sidebar">
      <ScrollStrip className="editor-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`editor-tab${active === t.id ? ' active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </ScrollStrip>
      {TABS.map((t) => {
        const Panel = PANELS[t.id];
        return (
          <div key={t.id} className={`editor-panel${active === t.id ? ' active' : ''}`}>
            <Panel data={data} actions={actions} />
          </div>
        );
      })}
    </div>
  );
}
