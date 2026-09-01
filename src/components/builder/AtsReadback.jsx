export default function AtsReadback({ open, text }) {
  return (
    <div className={`ats-readback${open ? ' show' : ''}`}>
      <h4>✓ ATS Parser Readback — reading order intact</h4>
      <pre>{text}</pre>
    </div>
  );
}
