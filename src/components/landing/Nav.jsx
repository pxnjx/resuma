import { navigate } from '../../router.jsx';
import Icon from '../Icon.jsx';

function scrollToId(id) {
  return (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
}

function go(to) {
  return (e) => {
    e.preventDefault();
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

export default function Nav() {
  return (
    <nav>
      <a
        className="nav-logo"
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        Resuma <span>Resume Builder</span>
      </a>
      <div className="nav-links">
        <a href="#features" onClick={scrollToId('features')}>Features</a>
        <a href="#how-it-works" onClick={scrollToId('how-it-works')}>How it works</a>
        <a href="#templates" onClick={scrollToId('templates')}>Templates</a>
        <a href="#/dashboard" className="btn-nav" onClick={go('/dashboard')}>
          Open Dashboard
          <Icon name="arrow-right" size={13} />
        </a>
      </div>
    </nav>
  );
}

