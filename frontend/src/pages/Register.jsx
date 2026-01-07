// src/pages/Register.jsx

import React, { useState } from 'react';
import axios from '../api'; // Adjust import path based on your folder structure
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const navigate = useNavigate(); // useNavigate instead of useHistory

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setRegistrationError('');
    try {
      const response = await axios.post('/auth/register', { username, email, password });
      setIsSubmitting(false);
      // Store token and redirect
      localStorage.setItem('jwtToken', response.data.token);
      // Dispatch custom event to update header
      window.dispatchEvent(new Event('authChange'));
      navigate('/'); // Navigate to home after successful registration
    } catch (error) {
      setIsSubmitting(false);
      setRegistrationError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleRegister} style={styles.form}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          style={styles.input}
          required 
        />
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
        {registrationError && <p style={styles.error}>{registrationError}</p>}
        <button type="submit" style={isSubmitting ? styles.buttonSubmitting : styles.button}>
          {isSubmitting ? 'Submitting...' : 'Register'}
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
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid #00ff41',
    padding: '30px',
    borderRadius: '4px',
    boxShadow: '0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 30px rgba(0, 255, 65, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    backgroundColor: 'transparent',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
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

export default Register;
