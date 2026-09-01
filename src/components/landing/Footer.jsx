import { Link } from '../../router.jsx';

export default function Footer() {
  return (
    <footer>
      <p>
        <strong>Resuma.</strong> — Resume. Résumé. Land the interview, not the
        reject pile.
      </p>
      <p style={{ marginTop: 8 }}>
        Your resume never leaves your browser. Open the{' '}
        <Link to="/dashboard">platform dashboard</Link> to start building.
      </p>
    </footer>
  );
}

