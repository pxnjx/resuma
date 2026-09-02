import Icon from '../Icon.jsx';

// Shared card for repeatable resume entries (experience, education,
// projects, certifications, languages) with a drag handle for native
// HTML5 drag & drop reordering, plus up/down arrow buttons so entries
// can also be moved with a single tap on touch screens.
export default function EntryCard({
  index,
  total,
  dragFrom,
  overIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMove,
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
        <div className="entry-card-tools">
          <span
            className="drag-handle"
            title="Drag to reorder"
            draggable
            onDragStart={onDragStart(index)}
            onDragEnd={onDragEnd}
          >
            <Icon name="grip-vertical" size={14} />
          </span>
          {onMove && (
            <>
              <button
                type="button"
                className="move-entry"
                title="Move up"
                aria-label="Move entry up"
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
              >
                <Icon name="arrow-up" size={14} />
              </button>
              <button
                type="button"
                className="move-entry"
                title="Move down"
                aria-label="Move entry down"
                disabled={total == null || index >= total - 1}
                onClick={() => onMove(index, index + 1)}
              >
                <Icon name="arrow-down" size={14} />
              </button>
            </>
          )}
        </div>
        <button type="button" className="remove-entry" title="Remove entry" onClick={onRemove}>
          <Icon name="x" size={14} />
        </button>
      </div>
      {children}
    </div>
  );
}

