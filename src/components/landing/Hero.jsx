import { Link } from '../../router.jsx';
import Icon from '../Icon.jsx';

export default function Hero() {
  return (
    <section className="hero">
      <h1>
        Build a resume that
        <br />
        <span className="grad">passes every ATS scan.</span>
      </h1>
      <p>
        Resuma runs fully in your browser — your data stays on your device, and
        every export is clean, structured, and easy for recruiters&apos; software
        to read back.
      </p>
      <div className="hero-buttons">
        <Link to="/dashboard" className="btn-primary">
          <Icon name="play" size={14} />
          Create My Resume
        </Link>
        <Link to="/templates" className="btn-secondary">Browse Templates</Link>
      </div>
      <div className="stats">
        <div className="stat">
          <div className="stat-value">100%</div>
          <div className="stat-label">Local-First</div>
        </div>
        <div className="stat">
          <div className="stat-value">0</div>
          <div className="stat-label">Accounts Needed</div>
        </div>
        <div className="stat">
          <div className="stat-value">6</div>
          <div className="stat-label">Export Formats</div>
        </div>
        <div className="stat">
          <div className="stat-value">∞</div>
          <div className="stat-label">Free Forever</div>
        </div>
      </div>
    </section>
  );
}

