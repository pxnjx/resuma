import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon.jsx';

// Scrollable strip with < and > hint arrows at each end (visible on
// mobile where the strip overflows). The arrows scroll the container so
// users know the tab bar can be swiped.
export default function ScrollStrip({ className, children, step = 180 }) {
  const ref = useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanL(el.scrollLeft > 2);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="scroll-strip">
      <button
        type="button"
        className={`scroll-arrow left${canL ? '' : ' hidden'}`}
        aria-label="Scroll tab strip left"
        onClick={() => scroll(-1)}
      >
        <Icon name="chevron-left" size={14} />
      </button>
      <div className={className} ref={ref}>
        {children}
      </div>
      <button
        type="button"
        className={`scroll-arrow right${canR ? '' : ' hidden'}`}
        aria-label="Scroll tab strip right"
        onClick={() => scroll(1)}
      >
        <Icon name="chevron-right" size={14} />
      </button>
    </div>
  );
}