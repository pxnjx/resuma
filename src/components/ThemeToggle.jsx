import Icon from './Icon.jsx';

// Single-icon theme switch: sun = light (current theme), moon = dark.
// The icon always shows the active theme; clicking flips it. Used on the
// Dashboard, Home (nav), and Editor top bar.

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`theme-toggle${isDark ? ' dark' : ' light'}`}
      onClick={onToggle}
    >
      <Icon name={isDark ? 'moon' : 'sun'} size={16} />
    </button>
  );
}