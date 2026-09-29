import { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';

const TRIAL_DAYS = 3;
const PRICE_KOBO = 500000; // ₦5,000 in kobo (Paystack uses kobo)

export default function Dashboard() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [message, setMessage] = useState('');
  const [trialStatus, setTrialStatus] = useState(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const savedNumber = localStorage.getItem('whatsapp_number') || '';
    const savedLink = localStorage.getItem('telegram_link') || '';
    const savedPaid = localStorage.getItem('paid') === 'true';
    setWhatsappNumber(savedNumber);
    setTelegramLink(savedLink);
    setPaid(savedPaid);

    let startDate = localStorage.getItem('trial_start');
    if (!startDate) {
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

  // Paystack configuration
  const paystackConfig = {
    reference: `WA-${Date.now()}`,
    email: 'user@example.com', // We'll replace with real user email later
    amount: PRICE_KOBO,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    currency: 'NGN',
  };

  const onSuccess = (reference) => {
    localStorage.setItem('paid', 'true');
    setPaid(true);
    alert('✅ Payment received! Welcome to WA Redirect Pro.');
  };

  const onClose = () => {
    console.log('Payment window closed');
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  if (!trialStatus) {
    return <div style={styles.page}><p>Loading...</p></div>;
  }

  // PAID USER — show dashboard
  if (paid) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.banner}>
            ✅ Subscribed — <b>Active</b>
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

  // TRIAL EXPIRED — show paywall
  if (!trialStatus.active) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>⏰ Your Free Trial Has Ended</h1>
          <p style={styles.subtitle}>
            Subscribe for just <b>₦5,000/month</b> to keep using WA Redirect.
          </p>
          <button
            style={styles.button}
            onClick={() => initializePayment({ onSuccess, onClose })}
          >
            Pay ₦5,000/month
          </button>
        </div>
      </div>
    );
  }

  // TRIAL ACTIVE — show dashboard with banner
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
