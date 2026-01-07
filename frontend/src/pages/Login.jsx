import React, { useState } from 'react';
import axios from '../api'; // Adjust import path based on your folder structure
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');
    try {
      const response = await axios.post('/auth/login', { email, password });
      setIsSubmitting(false);
      // Store token in local storage with correct key
      localStorage.setItem('jwtToken', response.data.token);
      // Dispatch custom event to update header
      window.dispatchEvent(new Event('authChange'));
      navigate('/'); // Redirect to home or dashboard after successful login
    } catch (error) {
      setIsSubmitting(false);
      setLoginError(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={styles.input}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={styles.input}
          required
        />
        {loginError && <p style={styles.error}>{loginError}</p>}
        <button type="submit" style={isSubmitting ? styles.buttonSubmitting : styles.button}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '50px',
    minHeight: '100vh',
    background: '#000000',
    color: '#00ff41',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '30px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '700',
    letterSpacing: '3px',
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 10, 46, 0.7) 50%, rgba(10, 10, 10, 0.9) 100%)',
    border: '1px solid #00ff41',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: `0 0 30px rgba(0, 255, 65, 0.5), 0 0 60px rgba(102, 126, 234, 0.3), inset 0 0 30px rgba(0, 255, 65, 0.1)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #00ff41',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#00ff41',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: "'Share Tech Mono', monospace",
    transition: 'all 0.3s',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3), 0 0 40px rgba(102, 126, 234, 0.2)',
  },
  buttonSubmitting: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    color: 'rgba(0, 255, 65, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.5)',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'not-allowed',
    fontFamily: "'Share Tech Mono', monospace",
  },
  error: {
    color: '#ff0040',
    fontSize: '0.9rem',
    marginBottom: '10px',
    textAlign: 'center',
    textShadow: '0 0 10px #ff0040',
    fontFamily: "'Share Tech Mono', monospace",
    padding: '10px',
    background: 'rgba(255, 0, 64, 0.1)',
    border: '1px solid #ff0040',
    borderRadius: '4px',
    width: '100%',
  },
};

export default Login;
