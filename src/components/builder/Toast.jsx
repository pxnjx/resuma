import Icon from '../Icon.jsx';

const TYPE_ICONS = {
  success: 'circle-check',
  error: 'circle-x',
  warn: 'triangle-alert',
  info: 'info',
};

// Toast notification with an SVG status icon (success / error / warn / info).
export default function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast${message ? ' show' : ''} toast-${type}`} role="status">
      {message ? (
        <>
          <Icon name={TYPE_ICONS[type] || 'info'} size={16} className="toast-icon" />
          <span>{message}</span>
        </>
      ) : null}
    </div>
  );
}

