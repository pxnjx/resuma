import { Link } from '../../router.jsx';
import Icon from '../Icon.jsx';

export default function Hero() {
  return (
    <section className="hero">
      <div className="badge">
        <Icon name="star" size={12} />
        Free &amp; Open Source
      </div>
      <h1>
        Land The Interview,
        <br />
        <span className="grad">Not The Reject Pile.</span>
      </h1>
      <p>
        A local-first resume builder that stays entirely in your browser. No
        account, nothing uploaded. Style it freely — every export is structured
        to sail through applicant tracking systems.
      </p>
      <div className="hero-buttons">
        <Link to="/dashboard" className="btn-primary">
          <Icon name="play" size={14} />
          Start Building Free
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
          <div className="stat-value">5</div>
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

