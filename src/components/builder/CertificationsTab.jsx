import { useState } from 'react';
import EntryCard from './EntryCard.jsx';
import Field from './Field.jsx';

export default function CertificationsTab({ data, actions }) {
  const [dragFrom, setDragFrom] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const onDragStart = (i) => (e) => {
    setDragFrom(i);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i));
  };
  const onDragOver = (i) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragFrom !== null && i !== dragFrom) setOverIndex(i);
  };
  const onDrop = (i) => (e) => {
    e.preventDefault();
    if (dragFrom !== null && dragFrom !== i) actions.moveCertification(dragFrom, i);
    setDragFrom(null);
    setOverIndex(null);
  };
  const onDragEnd = () => {
    setDragFrom(null);
    setOverIndex(null);
  };

  return (
    <>
      {data.certifications.map((entry, i) => (
        <EntryCard
          key={i}
          index={i}
          dragFrom={dragFrom}
          overIndex={overIndex}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onRemove={() => actions.removeCertification(i)}
        >
          <Field label="Certification Name">
            <input
              className="field-input"
              value={entry.name}
              onChange={(e) => actions.updateCertification(i, 'name', e.target.value)}
              placeholder="e.g. AWS Certified Cloud Practitioner"
            />
          </Field>
          <div className="field-row">
            <Field label="Issuer">
              <input
                className="field-input"
                value={entry.issuer}
                onChange={(e) => actions.updateCertification(i, 'issuer', e.target.value)}
                placeholder="e.g. Amazon Web Services"
              />
            </Field>
            <Field label="Year">
              <input
                className="field-input"
                value={entry.year}
                onChange={(e) => actions.updateCertification(i, 'year', e.target.value)}
                placeholder="e.g. 2024"
              />
            </Field>
          </div>
        </EntryCard>
      ))}
      <button type="button" className="add-btn" onClick={actions.addCertification}>
        + Add Certification
      </button>
    </>
  );
}
