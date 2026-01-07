import React, { useState, useEffect } from 'react';
import axios from '../api';
import encryption from '../utils/encryption';
import ipfsService from '../utils/ipfsService';
import { logEvent } from '../utils/analytics';

const IPFSStorage = () => {
  const [data, setData] = useState([]);
  const [decryptedData, setDecryptedData] = useState([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [masterKey, setMasterKey] = useState(null);

  useEffect(() => {
    checkAuthMode();
    fetchData();
    fetchStats();
  }, []);

  const checkAuthMode = () => {
    const anonymousId = localStorage.getItem('anonymousId');
    setIsAnonymous(!!anonymousId);
    
    if (anonymousId) {
      const encryptedMasterKey = localStorage.getItem('encryptedMasterKey');
      const passphrase = sessionStorage.getItem('passphrase');
      
      if (encryptedMasterKey && passphrase) {
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
      const response = await axios.get('/ipfs/retrieve');
      if (response.data.success) {
        const encryptedItems = response.data.data || [];
        setData(encryptedItems);
        
        if (isAnonymous && masterKey) {
          await encryption.initialize();
          const decrypted = await Promise.all(
            encryptedItems.map(async (item) => {
              try {
                // Retrieve full data from IPFS
                const contentResponse = await axios.get(`/ipfs/content/${item.cid}`);
                if (contentResponse.data.success && contentResponse.data.data) {
                  const ipfsData = contentResponse.data.data;
                  const keyData = JSON.parse(ipfsData.encryptedKey);
                  const valueData = JSON.parse(ipfsData.encryptedValue);
                  
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
                }
                return { ...item, key: '[Encrypted]', value: '[Encrypted]' };
              } catch (e) {
                console.error('Decryption error:', e);
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

  const fetchStats = async () => {
    try {
      const response = await axios.get('/ipfs/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        await encryption.initialize();
        const encryptedKey = await encryption.encryptSymmetric(key.trim(), masterKey);
        const encryptedValue = await encryption.encryptSymmetric(value.trim(), masterKey);
        
        payload = {
          encryptedKey: JSON.stringify(encryptedKey),
          encryptedValue: JSON.stringify(encryptedValue),
          encryptionNonce: encryptedKey.nonce
        };
      } else {
        payload = {
          key: key.trim(),
          value: value.trim()
        };
      }
      
      const response = await axios.post('/ipfs/store', payload);
      if (response.data.success) {
        setSuccess(`Data stored on IPFS! CID: ${response.data.cid}`);
        setKey('');
        setValue('');
        fetchData();
        fetchStats();
        logEvent('ipfs_store', { isAnonymous, cid: response.data.cid });
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error storing data:', error);
      setError(error.response?.data?.message || 'Failed to store data on IPFS');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, cid) => {
    if (!window.confirm('Are you sure you want to delete this data from IPFS?')) {
      return;
    }

    try {
      await axios.delete(`/ipfs/delete/${id}`);
      setSuccess('Data deleted from IPFS');
      fetchData();
      fetchStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete data');
    }
  };

  const displayData = isAnonymous && masterKey ? decryptedData : data;

  return (
    <div style={styles.container}>
        <h2 style={styles.title}>🌐 Decentralized IPFS Storage</h2>
        <p style={styles.subtitle}>
          Store your encrypted data on the InterPlanetary File System (IPFS) - 
          decentralized, immutable, and censorship-resistant
        </p>

        {stats && (
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <strong>{stats.totalRecords}</strong> records
            </div>
            <div style={styles.statItem}>
              <strong>{(stats.totalSize / 1024).toFixed(2)}</strong> KB stored
            </div>
          </div>
        )}

        <form onSubmit={handleStoreData} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Data key"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Value</label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Data value"
              style={styles.textarea}
              rows={4}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
          <button
            type="submit"
            style={isSubmitting ? styles.buttonSubmitting : styles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Storing on IPFS...' : '🌐 Store on IPFS'}
          </button>
        </form>

        <div style={styles.dataSection}>
          <h3 style={styles.sectionTitle}>Your IPFS Data</h3>
          {loading ? (
            <p style={styles.loading}>Loading...</p>
          ) : displayData.length === 0 ? (
            <p style={styles.empty}>No data stored on IPFS yet</p>
          ) : (
            <div style={styles.dataList}>
              {displayData.map((item) => (
                <div key={item.id || item._id} style={styles.dataItem}>
                  <div style={styles.dataContent}>
                    <div style={styles.dataHeader}>
                      <strong style={styles.dataKey}>
                        {item.key || '[Encrypted Key]'}
                      </strong>
                      <span style={styles.cid}>CID: {item.cid?.substring(0, 20)}...</span>
                    </div>
                    <p style={styles.dataValue}>
                      {item.value || '[Encrypted Value]'}
                    </p>
                    {item.gatewayURL && (
                      <a
                        href={item.gatewayURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.gatewayLink}
                      >
                        View on IPFS Gateway →
                      </a>
                    )}
                    {item.previousCID && (
                      <p style={styles.previousCID}>
                        Previous version: {item.previousCID.substring(0, 20)}...
                      </p>
                    )}
                    <p style={styles.date}>
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id || item._id, item.cid)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
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
  title: {
    fontSize: '2rem',
    marginBottom: '10px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '700',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.8)',
    marginBottom: '30px',
    fontFamily: "'Share Tech Mono', monospace",
  },
  stats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
  },
  statItem: {
    fontSize: '1rem',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    color: '#00ff41',
    fontWeight: '500',
    fontFamily: "'Share Tech Mono', monospace",
    textShadow: '0 0 5px #00ff41',
  },
  input: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #00ff41',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#00ff41',
    fontSize: '1rem',
    fontFamily: "'Share Tech Mono', monospace",
    transition: 'all 0.3s',
  },
  textarea: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #00ff41',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#00ff41',
    fontSize: '1rem',
    fontFamily: "'Share Tech Mono', monospace",
    resize: 'vertical',
    transition: 'all 0.3s',
  },
  button: {
    padding: '14px',
    background: 'transparent',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
    transition: 'all 0.3s',
  },
  buttonSubmitting: {
    padding: '14px',
    background: 'rgba(0, 255, 65, 0.1)',
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
    textShadow: '0 0 10px #ff0040',
    fontFamily: "'Share Tech Mono', monospace",
    padding: '10px',
    background: 'rgba(255, 0, 64, 0.1)',
    border: '1px solid #ff0040',
    borderRadius: '4px',
  },
  success: {
    color: '#00ff41',
    fontSize: '0.9rem',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
    padding: '10px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
  },
  dataSection: {
    marginTop: '30px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
  },
  loading: {
    fontSize: '1rem',
    color: '#00ff41',
    textShadow: '0 0 5px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  empty: {
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.6)',
    textAlign: 'center',
    padding: '20px',
    fontFamily: "'Share Tech Mono', monospace",
  },
  dataList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  dataItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
    gap: '15px',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  dataContent: {
    flex: 1,
  },
  dataHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  dataKey: {
    color: '#00ff41',
    fontSize: '1.1rem',
    textShadow: '0 0 5px #00ff41',
    fontWeight: '600',
  },
  cid: {
    fontSize: '0.8rem',
    color: 'rgba(0, 255, 65, 0.7)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  dataValue: {
    color: 'rgba(0, 255, 65, 0.9)',
    marginBottom: '10px',
    wordBreak: 'break-word',
  },
  gatewayLink: {
    color: '#00ff41',
    textDecoration: 'none',
    fontSize: '0.9rem',
    display: 'inline-block',
    marginBottom: '10px',
    textShadow: '0 0 5px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  previousCID: {
    fontSize: '0.8rem',
    color: 'rgba(0, 255, 65, 0.6)',
    fontFamily: "'Share Tech Mono', monospace",
    marginBottom: '5px',
  },
  date: {
    fontSize: '0.8rem',
    color: 'rgba(0, 255, 65, 0.6)',
    marginTop: '5px',
  },
  deleteButton: {
    padding: '8px 16px',
    background: 'transparent',
    color: '#ff0040',
    border: '1px solid #ff0040',
    borderRadius: '5px',
    cursor: 'pointer',
    height: 'fit-content',
  },
};

export default IPFSStorage;

