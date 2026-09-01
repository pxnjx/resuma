// Shared card for repeatable resume entries (experience, education,
// projects, certifications, languages) with a drag handle (⠿) that
// enables native HTML5 drag & drop reordering.
export default function EntryCard({
  index,
  dragFrom,
  overIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
  children,
}) {
  const isOver = overIndex === index && dragFrom !== null && dragFrom !== index;
  const isDragging = dragFrom === index;

  return (
    <div
      className={`entry-card${isOver ? ' drag-over' : ''}${isDragging ? ' dragging' : ''}`}
      onDragOver={onDragOver(index)}
      onDrop={onDrop(index)}
    >
      <div className="entry-card-head">
        <span
          className="drag-handle"
          title="Drag to reorder"
          draggable
          onDragStart={onDragStart(index)}
          onDragEnd={onDragEnd}
        >
          ⠿
        </span>
        <button type="button" className="remove-entry" title="Remove entry" onClick={onRemove}>
          ✕
        </button>
      </div>
      {children}
    </div>
  );
}
