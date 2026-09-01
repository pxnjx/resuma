import Field from './Field.jsx';

export default function ProfileTab({ data, actions }) {
  const set = (key) => (e) => actions.updateField(key, e.target.value);

  return (
    <>
      <Field label="Full Name">
        <input
          className="field-input"
          value={data.name}
          onChange={set('name')}
          placeholder="e.g. John Doe"
        />
      </Field>
      <Field label="Job Title / Tagline">
        <input
          className="field-input"
          value={data.title}
          onChange={set('title')}
          placeholder="e.g. Senior Frontend Engineer"
        />
      </Field>
      <div className="field-row">
        <Field label="Email">
          <input
            className="field-input"
            type="email"
            value={data.email}
            onChange={set('email')}
            placeholder="john@example.com"
          />
        </Field>
        <Field label="Phone">
          <input
            className="field-input"
            value={data.phone}
            onChange={set('phone')}
            placeholder="+1 234 567 890"
          />
        </Field>
      </div>
      <div className="field-row">
        <Field label="Location">
          <input
            className="field-input"
            value={data.location}
            onChange={set('location')}
            placeholder="Jakarta, Indonesia"
          />
        </Field>
        <Field label="LinkedIn / Website">
          <input
            className="field-input"
            value={data.linkedin}
            onChange={set('linkedin')}
            placeholder="linkedin.com/in/johndoe"
          />
        </Field>
      </div>
    </>
  );
}
