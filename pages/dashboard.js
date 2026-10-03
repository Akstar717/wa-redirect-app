import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TRIAL_DAYS = 3;

export default function Dashboard() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [message, setMessage] = useState('');
  const [trialStatus, setTrialStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      let { data: sub } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!sub) {
        const { data: newSub } = await supabase
          .from('subscribers')
          .insert({ user_id: user.id, email: user.email, subscription_status: 'trial' })
          .select()
          .single();
        sub = newSub;
      }

      if (sub) {
        setWhatsappNumber(sub.whatsapp_number || '');
        setTelegramLink(sub.telegram_link || '');
        const start = new Date(sub.trial_start);
        const daysUsed = Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
        const daysLeft = TRIAL_DAYS - daysUsed;

        if (sub.subscription_status === 'active') {
          setTrialStatus({ active: true, subscribed: true, daysLeft: 999 });
        } else if (daysLeft > 0) {
          setTrialStatus({ active: true, subscribed: false, daysLeft });
        } else {
          setTrialStatus({ active: false, subscribed: false, daysLeft: 0 });
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const saveSettings = async () => {
    if (!whatsappNumber || !telegramLink) {
      setMessage('Please fill in both fields.');
      return;
    }
    if (!user) {
      setMessage('❌ You are not logged in.');
      return;
    }
    const { error } = await supabase
      .from('subscribers')
      .update({ whatsapp_number: whatsappNumber, telegram_link: telegramLink })
      .eq('user_id', user.id);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Saved! Your auto-redirect is now active.');
    }
  };

  if (loading) return <div style={styles.page}><p>Loading...</p></div>;

  // SUBSCRIBED — full dashboard
  if (trialStatus?.subscribed) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.banner}>✅ Subscribed — <b>Active</b></div>
          <h1 style={styles.title}>Your Dashboard</h1>
          <p style={styles.subtitle}>Set up your auto-redirect below.</p>

          <label style={styles.label}>WhatsApp Business Number</label>
          <input type="text" placeholder="+2348012345678" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} style={styles.input} />

          <label style={styles.label}>Your Telegram Link</label>
          <input type="url" placeholder="https://t.me/yourchannel" value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} style={styles.input} />

          <button onClick={saveSettings} style={styles.button}>Save & Activate</button>
          {message && <p style={styles.message}>{message}</p>}
        </div>
      </div>
    );
  }

  // TRIAL EXPIRED — manual payment instructions
  if (trialStatus && !trialStatus.active) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>⏰ Your Free Trial Has Ended</h1>
          <p style={styles.subtitle}>
            To continue using WA Redirect, send <b>₦5,000</b> to the account below.
          </p>

          <div style={styles.bankBox}>
            <p style={styles.bankLine}><b>Bank:</b> [YOUR BANK NAME]</p>
            <p style={styles.bankLine}><b>Account Name:</b> [ACCOUNT NAME]</p>
            <p style={styles.bankLine}><b>Account Number:</b> [ACCOUNT NUMBER]</p>
            <p style={styles.bankLine}><b>Amount:</b> ₦5,000</p>
          </div>

          <p style={styles.subtitle}>
            After sending, message us on WhatsApp with your payment receipt:
          </p>

          <a
            href="https://wa.me/2348012345678?text=Hi%2C%20I%20just%20paid%20%E2%82%A65%2C000%20for%20WA%20Redirect.%20Here%20is%20my%20receipt."
            style={styles.button}
            target="_blank"
            rel="noopener noreferrer"
          >
            Send Receipt on WhatsApp
          </a>

          <p style={styles.smallText}>
            Your account will be activated within 24 hours after we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  // TRIAL ACTIVE
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.banner}>🎉 Free trial: <b>{trialStatus?.daysLeft} day(s) left</b></div>
        <h1 style={styles.title}>Your Dashboard</h1>
        <p style={styles.subtitle}>Set up your auto-redirect below.</p>

        <label style={styles.label}>WhatsApp Business Number</label>
        <input type="text" placeholder="+2348012345678" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} style={styles.input} />

        <label style={styles.label}>Your Telegram Link</label>
        <input type="url" placeholder="https://t.me/yourchannel" value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} style={styles.input} />

        <button onClick={saveSettings} style={styles.button}>Save & Activate</button>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' },
  card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%' },
  banner: { background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px', fontSize: '14px' },
  title: { fontSize: '26px', color: '#166534', marginBottom: '8px' },
  subtitle: { color: '#666', marginBottom: '24px', fontSize: '14px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', marginBottom: '18px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  button: { display: 'block', width: '100%', background: '#16a34a', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box', marginTop: '10px' },
  message: { marginTop: '16px', textAlign: 'center', color: '#166534' },
  bankBox: { background: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bbf7d0' },
  bankLine: { margin: '6px 0', color: '#166534', fontSize: '14px' },
  smallText: { marginTop: '16px', fontSize: '12px', color: '#999', textAlign: 'center' },
};
