import { useState } from 'react';
import EntryCard from './EntryCard.jsx';
import Field from './Field.jsx';

export default function ExperienceTab({ data, actions }) {
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
    if (dragFrom !== null && dragFrom !== i) actions.moveExperience(dragFrom, i);
    setDragFrom(null);
    setOverIndex(null);
  };
  const onDragEnd = () => {
    setDragFrom(null);
    setOverIndex(null);
  };

  return (
    <>
      {data.experience.map((entry, i) => (
        <EntryCard
          key={i}
          index={i}
          total={data.experience.length}
          onMove={actions.moveExperience}
          dragFrom={dragFrom}
          overIndex={overIndex}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onRemove={() => actions.removeExperience(i)}
        >
          <Field label="Position Title">
            <input
              className="field-input"
              value={entry.title}
              onChange={(e) => actions.updateExperience(i, 'title', e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </Field>
          <Field label="Company">
            <input
              className="field-input"
              value={entry.company}
              onChange={(e) => actions.updateExperience(i, 'company', e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </Field>
          <div className="field-row">
            <Field label="Start Date">
              <input
                className="field-input"
                value={entry.start}
                onChange={(e) => actions.updateExperience(i, 'start', e.target.value)}
                placeholder="Mar 2022"
              />
            </Field>
            <Field label="End Date">
              <input
                className="field-input"
                value={entry.end}
                onChange={(e) => actions.updateExperience(i, 'end', e.target.value)}
                placeholder="Present"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="field-input"
              rows={4}
              value={entry.desc}
              onChange={(e) => actions.updateExperience(i, 'desc', e.target.value)}
              placeholder={'• Led migration of a 200k-line codebase\n• Cut UI defects by 40%'}
            />
          </Field>
        </EntryCard>
      ))}
      <button type="button" className="add-btn" onClick={actions.addExperience}>
        + Add Experience
      </button>
    </>
  );
}
