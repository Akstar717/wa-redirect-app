export default function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛡️ WA Redirect</h1>
        <p style={styles.subtitle}>
          Stop WhatsApp bans. Redirect your group members to Telegram automatically.
        </p>

        <ul style={styles.list}>
          <li>✅ Never get banned again</li>
          <li>✅ Members auto-redirected to your Telegram</li>
          <li>✅ $7/month — cancel anytime</li>
        </ul>

        <a href="/dashboard" style={styles.button}>
          Get Started
        </a>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    textAlign: 'center',
  },
  title: { fontSize: '32px', marginBottom: '10px', color: '#166534' },
  subtitle: { fontSize: '16px', color: '#555', marginBottom: '20px' },
  list: { textAlign: 'left', lineHeight: '2', color: '#333', marginBottom: '30px' },
  button: {
    display: 'inline-block',
    background: '#16a34a',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};
