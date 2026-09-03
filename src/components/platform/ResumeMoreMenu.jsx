import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon.jsx';
import {
  exportDOCX,
  exportJSON,
  exportMarkdown,
  exportPDF,
  exportTXT,
} from '../../utils/exporters.js';

const DOWNLOAD_FORMATS = [
  { id: 'txt', name: 'Plain Text (.txt)', icon: 'file-text' },
  { id: 'pdf', name: 'PDF (.pdf)', icon: 'file-down' },
  { id: 'docx', name: 'Word (.docx)', icon: 'file' },
  { id: 'md', name: 'Markdown (.md)', icon: 'file-code' },
  { id: 'json', name: 'JSON (.json)', icon: 'file-check' },
];

// ⋮ menu for a saved resume: Edit / Duplicate / Download / Delete.
// Shared by the sidebar nav and the Dashboard cards. The popup is
// position: fixed (coords captured from the button when opened) so it
// never gets clipped by scroll containers. Download offers the formats
// that are generated directly from state (HTML needs the live preview
// DOM, so it lives only in the builder's Export ribbon).
export default function ResumeMoreMenu({ resume, onEdit, onDuplicate, onDelete, showToast }) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function toggle(e) {
    e.stopPropagation();
    if (!open) {
      const rect = e.currentTarget.getBoundingClientRect();
      const MENU_H = 200;
      const MENU_W = 210;
      const flipUp = window.innerHeight - rect.bottom < MENU_H + 12;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - MENU_W - 8));
      setPos({
        top: flipUp ? undefined : Math.round(rect.bottom + 6),
        bottom: flipUp ? Math.round(window.innerHeight - rect.top + 6) : undefined,
        left,
      });
    }
    setPicking(false);
    setOpen((v) => !v);
  }

  // Close on outside click, Escape, or any scroll. The menu is portaled to
  // document.body, so clicking inside it is NOT an "outside" click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      const inRoot = rootRef.current && rootRef.current.contains(e.target);
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!inRoot && !inMenu) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  function download(fmt) {
    const data = resume.data;
    try {
      if (fmt === 'txt') exportTXT(data);
      if (fmt === 'pdf') exportPDF(data);
      if (fmt === 'docx') exportDOCX(data);
      if (fmt === 'md') exportMarkdown(data);
      if (fmt === 'json') exportJSON(data);
      showToast?.('Downloaded as .' + fmt.toUpperCase());
    } catch (err) {
      showToast?.(err.message || 'Export failed', 'error');
    }
    setOpen(false);
  }

  return (
    <div className="resume-more" ref={rootRef}>
      <button
        type="button"
        className="resume-more-btn"
        title="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <Icon name="more-vertical" size={15} />
      </button>

      {open &&
        createPortal(
          <div
            className="resume-more-menu"
            style={{ top: pos.top, bottom: pos.bottom, left: pos.left }}
            role="menu"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
          {!picking ? (
            <>
              <button
                type="button"
                role="menuitem"
                className="resume-more-item"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
              >
                <Icon name="pencil" size={15} />
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                className="resume-more-item"
                onClick={() => {
                  setOpen(false);
                  onDuplicate();
                }}
              >
                <Icon name="copy" size={15} />
                Duplicate
              </button>
              <button
                type="button"
                role="menuitem"
                className="resume-more-item"
                onClick={() => setPicking(true)}
              >
                <Icon name="download" size={15} />
                Download
                <Icon name="arrow-right" size={13} className="resume-more-arrow" />
              </button>
              <div className="resume-more-sep" />
              <button
                type="button"
                className="resume-more-item danger"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
              >
                <Icon name="trash-2" size={15} />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="resume-more-item"
                onClick={() => setPicking(false)}
              >
                <Icon name="arrow-left" size={15} />
                Download format
              </button>
              {DOWNLOAD_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="menuitem"
                  className="resume-more-item"
                  onClick={() => download(f.id)}
                >
                  <Icon name={f.icon} size={15} />
                  {f.name}
                </button>
              ))}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}