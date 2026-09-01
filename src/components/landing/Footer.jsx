import { Link } from '../../router.jsx';

export default function Footer() {
  return (
    <footer>
      <p>
        <strong>Lanjut.</strong> — Resume. Résumé. The name is the pitch:{' '}
        <em>lanjut</em> means <em>continue</em>.
      </p>
      <p style={{ marginTop: 8 }}>
        Your resume never leaves your browser. Open the{' '}
        <Link to="/dashboard">platform dashboard</Link> to start building —{' '}
        <a href="https://lanjut.rimzzlabs.com/" target="_blank" rel="noreferrer">
          lanjut.rimzzlabs.com
        </a>
      </p>
    </footer>
  );
}
