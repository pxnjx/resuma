import { useState } from 'react';
import EntryCard from './EntryCard.jsx';
import Field from './Field.jsx';

export default function LanguagesTab({ data, actions }) {
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
    if (dragFrom !== null && dragFrom !== i) actions.moveLanguage(dragFrom, i);
    setDragFrom(null);
    setOverIndex(null);
  };
  const onDragEnd = () => {
    setDragFrom(null);
    setOverIndex(null);
  };

  return (
    <>
      {data.languages.map((entry, i) => (
        <EntryCard
          key={i}
          index={i}
          dragFrom={dragFrom}
          overIndex={overIndex}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onRemove={() => actions.removeLanguage(i)}
        >
          <div className="field-row">
            <Field label="Language">
              <input
                className="field-input"
                value={entry.name}
                onChange={(e) => actions.updateLanguage(i, 'name', e.target.value)}
                placeholder="e.g. Indonesian"
              />
            </Field>
            <Field label="Level (optional)">
              <input
                className="field-input"
                value={entry.level}
                onChange={(e) => actions.updateLanguage(i, 'level', e.target.value)}
                placeholder="e.g. Native / Professional"
              />
            </Field>
          </div>
        </EntryCard>
      ))}
      <button type="button" className="add-btn" onClick={actions.addLanguage}>
        + Add Language
      </button>
    </>
  );
}
