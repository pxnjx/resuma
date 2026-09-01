import Field from './Field.jsx';

export default function SummaryTab({ data, actions }) {
  return (
    <Field label="Professional Summary">
      <textarea
        className="field-input"
        rows={6}
        value={data.summary}
        onChange={(e) => actions.updateField('summary', e.target.value)}
        placeholder="Brief professional summary that highlights your key strengths and accomplishments..."
      />
    </Field>
  );
}
