// src/pages/Store.jsx

import React, { useState, useEffect } from 'react';
import axios from '../api';
import encryption from '../utils/encryption';
import { logEvent } from '../utils/analytics';

const Store = () => {
  const [data, setData] = useState([]);
  const [decryptedData, setDecryptedData] = useState([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [masterKey, setMasterKey] = useState(null);

  useEffect(() => {
    checkAuthMode();
    fetchData();
  }, []);

  const checkAuthMode = () => {
    const anonymousId = localStorage.getItem('anonymousId');
    setIsAnonymous(!!anonymousId);
    
    if (anonymousId) {
      // Try to get master key from session
      const encryptedMasterKey = localStorage.getItem('encryptedMasterKey');
      const passphrase = sessionStorage.getItem('passphrase');
      
      if (encryptedMasterKey && passphrase) {
        // Decrypt master key (in production, do this more securely)
        try {
          const masterKeyData = JSON.parse(encryptedMasterKey);
          encryption.decryptSymmetric(
            masterKeyData.encrypted,
            masterKeyData.nonce,
            passphrase
          ).then(key => setMasterKey(key));
        } catch (e) {
          console.error('Failed to decrypt master key:', e);
        }
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/retrieve/retrieve');
      if (response.data.success) {
        const encryptedItems = response.data.data || [];
        setData(encryptedItems);
        
        // Decrypt data if we have master key
        if (isAnonymous && masterKey) {
          await encryption.initialize();
          const decrypted = await Promise.all(
            encryptedItems.map(async (item) => {
              try {
                const keyData = JSON.parse(item.encryptedKey);
                const valueData = JSON.parse(item.encryptedValue);
                
                const decryptedKey = await encryption.decryptSymmetric(
                  keyData.encrypted,
                  keyData.nonce,
                  masterKey
                );
                const decryptedValue = await encryption.decryptSymmetric(
                  valueData.encrypted,
                  valueData.nonce,
                  masterKey
                );
                
                return {
                  ...item,
                  key: decryptedKey,
                  value: decryptedValue
                };
              } catch (e) {
                return { ...item, key: '[Encrypted]', value: '[Encrypted]' };
              }
            })
          );
          setDecryptedData(decrypted);
        } else {
          setDecryptedData(encryptedItems);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleStoreData = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    if (!key.trim() || !value.trim()) {
      setError('Both key and value are required');
      setIsSubmitting(false);
      return;
    }

    try {
      let payload;
      
      if (isAnonymous && masterKey) {
        // Encrypt client-side
        await encryption.initialize();
        const encryptedKey = await encryption.encryptSymmetric(key.trim(), masterKey);
        const encryptedValue = await encryption.encryptSymmetric(value.trim(), masterKey);
        
        payload = {
          encryptedKey: JSON.stringify(encryptedKey),
          encryptedValue: JSON.stringify(encryptedValue),
          encryptionNonce: encryptedKey.nonce
        };
      } else {
        // Server-side encryption (legacy mode)
        payload = {
          key: key.trim(),
          value: value.trim()
        };
      }
      
      const response = await axios.post('/store/store', payload);
      if (response.data.success) {
        setSuccess(response.data.message || 'Data stored successfully');
        setKey('');
        setValue('');
        fetchData();
        logEvent('store_data', { isAnonymous, usedMasterKey: !!masterKey });
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error storing data:', error);
      setError(error.response?.data?.message || 'Failed to store data');
      setIsSubmitting(false);
    }
  };

  const displayData = isAnonymous && masterKey ? decryptedData : data;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {isAnonymous ? '🔒 Encrypted Data Store' : 'Data Store'}
      </h2>
      {isAnonymous && (
        <p style={styles.privacyNote}>
          ✓ Quantum-resistant encryption enabled • Your data is encrypted before storage
        </p>
      )}
      <form onSubmit={handleStoreData} style={styles.form}>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Key"
          style={styles.input}
          required
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value"
          style={styles.input}
          required
        />
        <button type="submit" style={isSubmitting ? styles.buttonSubmitting : styles.button}>
          {isSubmitting ? 'Storing...' : isAnonymous ? '🔒 Store Encrypted Data' : 'Store Data'}
        </button>
      </form>
      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.dataSection}>
        <h3 style={styles.sectionTitle}>Your Stored Data</h3>
        {loading ? (
          <p style={styles.loading}>Loading data...</p>
        ) : displayData.length === 0 ? (
          <p style={styles.empty}>No data stored yet</p>
        ) : (
          <ul style={styles.list}>
            {displayData.map((item) => (
              <li key={item.id || item._id} style={styles.item}>
                <div style={styles.itemContent}>
                  <strong style={styles.key}>{item.key || '[Encrypted Key]'}:</strong>
                  <span style={styles.value}>{item.value || '[Encrypted Value]'}</span>
                  {item.createdAt && (
                    <span style={styles.date}>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    color: '#00ff41',
  },
  privacyNote: {
    fontSize: '0.9rem',
    color: '#00ff41',
    marginBottom: '20px',
    padding: '12px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    textShadow: '0 0 5px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  title: {
    fontSize: '2rem',
    marginBottom: '10px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '700',
    letterSpacing: '2px',
  },
  form: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.7) 0%, rgba(26, 10, 46, 0.5) 50%, rgba(10, 10, 10, 0.7) 100%)',
    border: '1px solid #00ff41',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2), 0 0 40px rgba(102, 126, 234, 0.15)',
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
    padding: '12px 24px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.3), 0 0 30px rgba(102, 126, 234, 0.2)',
  },
  buttonSubmitting: {
    padding: '12px 24px',
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    color: 'rgba(0, 255, 65, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.5)',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'not-allowed',
    fontFamily: "'Share Tech Mono', monospace",
  },
  dataSection: {
    width: '100%',
    maxWidth: '600px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '15px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
    letterSpacing: '1px',
  },
  loading: {
    fontSize: '1rem',
    color: '#00ff41',
    textShadow: '0 0 5px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  error: {
    fontSize: '1rem',
    color: '#ff0040',
    marginBottom: '10px',
    textShadow: '0 0 10px #ff0040',
    fontFamily: "'Share Tech Mono', monospace",
    padding: '10px',
    background: 'rgba(255, 0, 64, 0.1)',
    border: '1px solid #ff0040',
    borderRadius: '4px',
  },
  success: {
    fontSize: '1rem',
    color: '#00ff41',
    marginBottom: '10px',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
    padding: '10px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
  },
  empty: {
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.6)',
    textAlign: 'center',
    padding: '20px',
    fontFamily: "'Share Tech Mono', monospace",
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: '20px 0',
    width: '100%',
    maxWidth: '600px',
    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.7) 0%, rgba(26, 10, 46, 0.5) 50%, rgba(10, 10, 10, 0.7) 100%)',
    border: '1px solid #00ff41',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2), 0 0 40px rgba(102, 126, 234, 0.15)',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  item: {
    padding: '15px',
    borderBottom: '1px solid rgba(0, 255, 65, 0.3)',
    fontSize: '1rem',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
    transition: 'all 0.3s',
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  key: {
    color: '#00ff41',
    fontSize: '0.9rem',
    textShadow: '0 0 5px #00ff41',
    fontWeight: '600',
  },
  value: {
    color: 'rgba(0, 255, 65, 0.9)',
    wordBreak: 'break-word',
  },
  date: {
    fontSize: '0.8rem',
    color: 'rgba(0, 255, 65, 0.6)',
    marginTop: '5px',
  },
};

export default Store;
