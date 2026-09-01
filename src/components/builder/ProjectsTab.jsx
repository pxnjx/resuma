import { useState } from 'react';
import EntryCard from './EntryCard.jsx';
import Field from './Field.jsx';

export default function ProjectsTab({ data, actions }) {
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
    if (dragFrom !== null && dragFrom !== i) actions.moveProject(dragFrom, i);
    setDragFrom(null);
    setOverIndex(null);
  };
  const onDragEnd = () => {
    setDragFrom(null);
    setOverIndex(null);
  };

  return (
    <>
      {data.projects.map((entry, i) => (
        <EntryCard
          key={i}
          index={i}
          dragFrom={dragFrom}
          overIndex={overIndex}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onRemove={() => actions.removeProject(i)}
        >
          <Field label="Project Name">
            <input
              className="field-input"
              value={entry.name}
              onChange={(e) => actions.updateProject(i, 'name', e.target.value)}
              placeholder="e.g. Lanjut Resume Builder"
            />
          </Field>
          <Field label="Link (optional)">
            <input
              className="field-input"
              value={entry.link}
              onChange={(e) => actions.updateProject(i, 'link', e.target.value)}
              placeholder="e.g. github.com/you/project"
            />
          </Field>
          <Field label="Description">
            <textarea
              className="field-input"
              rows={3}
              value={entry.desc}
              onChange={(e) => actions.updateProject(i, 'desc', e.target.value)}
              placeholder={'• What it does\n• Tech stack / your role'}
            />
          </Field>
        </EntryCard>
      ))}
      <button type="button" className="add-btn" onClick={actions.addProject}>
        + Add Project
      </button>
    </>
  );
}
