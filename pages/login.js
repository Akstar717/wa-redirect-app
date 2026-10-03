import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    setMessage('Please wait...');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Account created! Now try logging in.');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(`❌ ${error.message}`);
      } else if (!data.session) {
        setMessage('❌ Login failed — no session returned.');
      } else {
        setMessage('✅ Logged in! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 800);
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{isSignUp ? 'Create Account' : 'Log In'}</h1>

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleSubmit} style={styles.button}>
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.toggle} onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' },
  card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' },
  title: { fontSize: '26px', color: '#166534', marginBottom: '24px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', marginBottom: '18px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', background: '#16a34a', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  message: { marginTop: '16px', textAlign: 'center', color: '#166534', fontSize: '14px' },
  toggle: { marginTop: '20px', textAlign: 'center', color: '#16a34a', cursor: 'pointer', fontSize: '14px' },
};
