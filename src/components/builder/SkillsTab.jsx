import Field from './Field.jsx';

export default function SkillsTab({ data, actions }) {
  return (
    <>
      <Field label="Skills (comma-separated)">
        <textarea
          className="field-input"
          rows={4}
          value={data.skills}
          onChange={(e) => actions.updateField('skills', e.target.value)}
          placeholder="JavaScript, TypeScript, React, Node.js, Python, Docker..."
        />
      </Field>
      <Field label={'Optional: Grouped Skills (one group per line, "Group: item, item")'}>
        <textarea
          className="field-input"
          rows={5}
          value={data.skillsGrouped}
          onChange={(e) => actions.updateField('skillsGrouped', e.target.value)}
          placeholder={'Frontend: React, Vue, TypeScript\nBackend: Node.js, Python, PostgreSQL\nDevOps: Docker, Kubernetes, AWS'}
        />
      </Field>
    </>
  );
}
