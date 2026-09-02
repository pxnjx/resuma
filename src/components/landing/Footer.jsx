import { Link } from '../../router.jsx';

export default function Footer() {
  return (
    <footer>
      <p>
        <strong>Resuma.</strong> — Write once, export anywhere.
      </p>
      <p style={{ marginTop: 8 }}>
        Your resume stays on your device. Open the{' '}
        <Link to="/dashboard">Dashboard</Link> to start a new one.
      </p>
    </footer>
  );
}

