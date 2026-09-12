import { useState, useEffect } from 'react';

const TRIAL_DAYS = 3;

export default function Dashboard() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [message, setMessage] = useState('');
  const [trialStatus, setTrialStatus] = useState(null);

  // Check trial status when the page loads
  useEffect(() => {
    const savedNumber = localStorage.getItem('whatsapp_number') || '';
    const savedLink = localStorage.getItem('telegram_link') || '';
    setWhatsappNumber(savedNumber);
    setTelegramLink(savedLink);

    let startDate = localStorage.getItem('trial_start');
    if (!startDate) {
      // First time visiting — start the trial now
      startDate = new Date().toISOString();
      localStorage.setItem('trial_start', startDate);
    }

    const start = new Date(startDate);
    const now = new Date();
    const daysUsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const daysLeft = TRIAL_DAYS - daysUsed;

    if (daysLeft > 0) {
      setTrialStatus({ active: true, daysLeft });
    } else {
      setTrialStatus({ active: false, daysLeft: 0 });
    }
  }, []);

  const saveSettings = async () => {
    if (!whatsappNumber || !telegramLink) {
      setMessage('Please fill in both fields.');
      return;
    }
    localStorage.setItem('whatsapp_number', whatsappNumber);
    localStorage.setItem('telegram_link', telegramLink);
    setMessage('✅ Saved! Your auto-redirect is now active.');
  };

  // Loading state
  if (!trialStatus) {
    return <div style={styles.page}><p>Loading...</p></div>;
  }

  // Trial expired — show paywall
  if (!trialStatus.active) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>⏰ Your Free Trial Has Ended</h1>
          <p style={styles.subtitle}>
            Your 3-day free trial is over. Subscribe for just <b>$7/month</b> to keep using WA Redirect.
          </p>
          <button style={styles.button} onClick={() => alert('Paystack coming on Day 5!')}>
            Pay $7/month
          </button>
        </div>
      </div>
    );
  }

  // Trial active — show dashboard
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.banner}>
          🎉 Free trial: <b>{trialStatus.daysLeft} day(s) left</b>
        </div>

        <h1 style={styles.title}>Your Dashboard</h1>
        <p style={styles.subtitle}>Set up your auto-redirect below.</p>

        <label style={styles.label}>WhatsApp Business Number</label>
        <input
          type="text"
          placeholder="+2348012345678"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Your Telegram Link</label>
        <input
          type="url"
          placeholder="https://t.me/yourchannel"
          value={telegramLink}
          onChange={(e) => setTelegramLink(e.target.value)}
          style={styles.input}
        />

        <button onClick={saveSettings} style={styles.button}>
          Save & Activate
        </button>

        {message && <p style={styles.message}>{message}</p>}
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
    width: '100%',
  },
  banner: {
    background: '#dcfce7',
    color: '#166534',
    padding: '10px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '14px',
  },
  title: { fontSize: '26px', color: '#166534', marginBottom: '8px' },
  subtitle: { color: '#666', marginBottom: '24px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '18px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    background: '#16a34a',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  message: { marginTop: '16px', textAlign: 'center', color: '#166534' },
};
