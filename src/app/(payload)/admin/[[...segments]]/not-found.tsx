export default function NotFound() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>404 — Page Not Found</h1>
      <p>This admin page does not exist.</p>
      <a href="/admin">← Back to Admin</a>
    </div>
  )
}
