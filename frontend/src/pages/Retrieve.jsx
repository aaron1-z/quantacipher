/**
 * Retrieve.jsx - Secure Data Retrieval Component
 * Allows authenticated users to retrieve stored data by key
 * Features:
 * - Form for inputting key to retrieve
 * - Displays only decrypted value (never shows encrypted data)
 * - JWT authentication required
 * - Clear success/error feedback and loading states
 */

import { useState } from 'react';
import axios from '../api';

const Retrieve = () => {
  // Form state management
  const [key, setKey] = useState('');
  
  // Data state management
  const [retrievedData, setRetrievedData] = useState(null);
  
  // UI state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle form submission to retrieve data by key
   * Makes authenticated GET request to /api/store?key=<key> endpoint
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setRetrievedData(null);

    try {
      // Send GET request to retrieve data by key
      const response = await axios.get(`/store?key=${encodeURIComponent(key)}`);
      
      // Set the retrieved data (contains decrypted value)
      setRetrievedData(response.data.data);
      
      // Clear the key input after successful retrieval
      setKey('');
    } catch (error) {
      // Handle different types of errors
      console.error('Error retrieving data:', error);
      
      let errorMessage = 'Failed to retrieve data. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'No data found for the specified key.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      setRetrievedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear retrieved data and reset form
   */
  const handleClear = () => {
    setRetrievedData(null);
    setError('');
    setKey('');
  };

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Retrieve Stored Data</h2>
      <p style={styles.description}>
        Enter the key to retrieve your securely stored data.
      </p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Key input field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Key:</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter the key for your stored data"
            style={styles.input}
            required
            disabled={isLoading}
          />
        </div>
        
        {/* Action buttons */}
        <div style={styles.buttonGroup}>
          <button 
            type="submit" 
            style={isLoading ? styles.buttonSubmitting : styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Retrieving...' : 'Retrieve Data'}
          </button>
          
          {(retrievedData || error) && (
            <button 
              type="button"
              onClick={handleClear}
              style={styles.clearButton}
              disabled={isLoading}
            >
              Clear
            </button>
          )}
        </div>
      </form>
      
      {/* Display retrieved data */}
      {retrievedData && (
        <div style={styles.resultContainer}>
          <h3 style={styles.resultTitle}>Retrieved Data:</h3>
          <div style={styles.dataCard}>
            <div style={styles.dataRow}>
              <strong>Key:</strong> {retrievedData.key}
            </div>
            <div style={styles.dataRow}>
              <strong>Value:</strong>
              <div style={styles.valueContainer}>
                {retrievedData.value}
              </div>
            </div>
            <div style={styles.dataRow}>
              <strong>Stored:</strong> {new Date(retrievedData.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
      
      {/* Display error message */}
      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorMessage}>{error}</p>
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
    marginBottom: '20px',
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
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    flex: 1,
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
    flex: 1,
    padding: '12px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'not-allowed',
  },
  clearButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  resultContainer: {
    width: '100%',
    maxWidth: '500px',
  },
  resultTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '15px',
    textAlign: 'center',
  },
  dataCard: {
    background: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    border: '2px solid #28a745',
  },
  dataRow: {
    marginBottom: '15px',
    fontSize: '1rem',
    color: '#333',
  },
  valueContainer: {
    marginTop: '8px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
  },
  errorContainer: {
    width: '100%',
    maxWidth: '500px',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    padding: '15px',
    borderRadius: '5px',
    fontSize: '1rem',
    textAlign: 'center',
  },
};

export default Retrieve;
