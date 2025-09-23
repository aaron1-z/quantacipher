/**
 * Store.jsx - Secure Data Storage Component
 * Allows authenticated users to store key-value pairs securely
 * Features:
 * - Form for inputting key and value
 * - JWT authentication required
 * - Clear success/error feedback
 * - Loading states for better UX
 */

import { useState } from 'react';
import axios from '../api';

const Store = () => {
  // Form state management
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  
  // UI state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  /**
   * Handle form submission to store key-value pair
   * Makes authenticated POST request to /api/store endpoint
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Send POST request to store endpoint with key-value data
      const response = await axios.post('/store', { key, value });
      
      // Show success message
      setMessage(response.data.message || 'Data stored successfully!');
      setMessageType('success');
      
      // Clear form on success
      setKey('');
      setValue('');
    } catch (error) {
      // Handle different types of errors
      console.error('Error storing data:', error);
      
      let errorMessage = 'Failed to store data. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid input. Please check your key and value.';
      }
      
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Secure Data Storage</h2>
      <p style={styles.description}>
        Store your sensitive data securely using encrypted key-value pairs.
      </p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Key input field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Key:</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter a unique key (e.g., 'password', 'secret')"
            style={styles.input}
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Value input field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Value:</label>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter the value to be stored securely"
            style={styles.textarea}
            required
            disabled={isSubmitting}
            rows="4"
          />
        </div>
        
        {/* Submit button with loading state */}
        <button 
          type="submit" 
          style={isSubmitting ? styles.buttonSubmitting : styles.button}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Storing...' : 'Store Data'}
        </button>
      </form>
      
      {/* Feedback message display */}
      {message && (
        <div style={{
          ...styles.message,
          ...(messageType === 'success' ? styles.successMessage : styles.errorMessage)
        }}>
          {message}
        </div>
      )}
    </main>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '50px 20px',
    minHeight: '100vh',
    background: '#f0f0f0',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '10px',
    color: '#333',
  },
  description: {
    fontSize: '1rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
    maxWidth: '500px',
  },
  form: {
    width: '100%',
    maxWidth: '500px',
    background: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '100px',
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
  message: {
    marginTop: '20px',
    padding: '15px',
    borderRadius: '5px',
    fontSize: '1rem',
    textAlign: 'center',
    maxWidth: '500px',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
};

export default Store;
