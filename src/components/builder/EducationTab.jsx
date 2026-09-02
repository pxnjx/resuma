import { useState } from 'react';
import EntryCard from './EntryCard.jsx';
import Field from './Field.jsx';

export default function EducationTab({ data, actions }) {
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
    if (dragFrom !== null && dragFrom !== i) actions.moveEducation(dragFrom, i);
    setDragFrom(null);
    setOverIndex(null);
  };
  const onDragEnd = () => {
    setDragFrom(null);
    setOverIndex(null);
  };

  return (
    <>
      {data.education.map((entry, i) => (
        <EntryCard
          key={i}
          index={i}
          total={data.education.length}
          onMove={actions.moveEducation}
          dragFrom={dragFrom}
          overIndex={overIndex}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onRemove={() => actions.removeEducation(i)}
        >
          <Field label="Degree">
            <input
              className="field-input"
              value={entry.degree}
              onChange={(e) => actions.updateEducation(i, 'degree', e.target.value)}
              placeholder="e.g. B.Sc. Computer Science"
            />
          </Field>
          <Field label="School">
            <input
              className="field-input"
              value={entry.school}
              onChange={(e) => actions.updateEducation(i, 'school', e.target.value)}
              placeholder="e.g. University of Indonesia"
            />
          </Field>
          <div className="field-row">
            <Field label="Start Date">
              <input
                className="field-input"
                value={entry.start}
                onChange={(e) => actions.updateEducation(i, 'start', e.target.value)}
                placeholder="2018"
              />
            </Field>
            <Field label="End Date">
              <input
                className="field-input"
                value={entry.end}
                onChange={(e) => actions.updateEducation(i, 'end', e.target.value)}
                placeholder="2022"
              />
            </Field>
          </div>
          <Field label="Notes (optional)">
            <input
              className="field-input"
              value={entry.desc}
              onChange={(e) => actions.updateEducation(i, 'desc', e.target.value)}
              placeholder="e.g. Magna Cum Laude, GPA 3.8"
            />
          </Field>
        </EntryCard>
      ))}
      <button type="button" className="add-btn" onClick={actions.addEducation}>
        + Add Education
      </button>
    </>
  );
}
