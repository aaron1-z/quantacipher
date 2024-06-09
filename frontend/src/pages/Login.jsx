import React, { useState } from 'react';
import axios from '../api'; // Adjust import path based on your folder structure
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/auth/login', { username, password });
      setIsSubmitting(false);
      alert('Login successful');
      // Example: Storing token in local storage
      localStorage.setItem('token', response.data.token);
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
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
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
    background: '#f0f0f0',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonSubmitting: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'not-allowed',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginBottom: '10px',
    textAlign: 'center',
  },
};

export default Login;
