import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePaystackPayment } from 'react-paystack';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TRIAL_DAYS = 3;
const PRICE_KOBO = 500000;

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
        const { data: newSub, error } = await supabase
          .from('subscribers')
          .insert({ user_id: user.id, email: user.email, subscription_status: 'trial' })
          .select()
          .single();
        if (error) console.error('Insert error:', error);
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

  const paystackConfig = {
    reference: `WA-${Date.now()}`,
    email: user?.email || 'user@example.com',
    amount: PRICE_KOBO,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    currency: 'NGN',
  };

  const onSuccess = async () => {
    await supabase
      .from('subscribers')
      .update({ subscription_status: 'active' })
      .eq('user_id', user.id);
    setTrialStatus({ active: true, subscribed: true, daysLeft: 999 });
    alert('✅ Payment received! Welcome to WA Redirect Pro.');
  };

  const onClose = () => console.log('Payment closed');
  const initializePayment = usePaystackPayment(paystackConfig);

  if (loading) return <div style={styles.page}><p>Loading...</p></div>;

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

  if (trialStatus && !trialStatus.active) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>⏰ Your Free Trial Has Ended</h1>
          <p style={styles.subtitle}>Subscribe for just <b>₦5,000/month</b> to keep using WA Redirect.</p>
          <button style={styles.button} onClick={() => initializePayment({ onSuccess, onClose })}>Pay ₦5,000/month</button>
        </div>
      </div>
    );
  }

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
  subtitle: { color: '#666', marginBottom: '24px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', marginBottom: '18px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', background: '#16a34a', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  message: { marginTop: '16px', textAlign: 'center', color: '#166534' },
};
