import React, { useState, useEffect } from 'react';
import axios from '../api';

const PrivacyDashboard = () => {
  const [stats, setStats] = useState({
    totalData: 0,
    totalShares: 0,
    anonymousId: null,
    publicKey: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get anonymous info if available
      const anonymousId = localStorage.getItem('anonymousId');
      if (anonymousId) {
        try {
          const infoResponse = await axios.get('/anonymous/info');
          if (infoResponse.data.success) {
            setStats(prev => ({
              ...prev,
              anonymousId: infoResponse.data.anonymousId,
              publicKey: infoResponse.data.publicKey.substring(0, 50) + '...'
            }));
          }
        } catch (e) {
          console.error('Error fetching anonymous info:', e);
        }

        // Get shares count
        try {
          const sharesResponse = await axios.get('/share/my-shares');
          if (sharesResponse.data.success) {
            setStats(prev => ({
              ...prev,
              totalShares: sharesResponse.data.sent.length + sharesResponse.data.received.length
            }));
          }
        } catch (e) {
          console.error('Error fetching shares:', e);
        }

        // Get data count
        try {
          const dataResponse = await axios.get('/retrieve/retrieve');
          if (dataResponse.data.success) {
            setStats(prev => ({
              ...prev,
              totalData: dataResponse.data.data?.length || 0
            }));
          }
        } catch (e) {
          console.error('Error fetching data:', e);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <div style={styles.container}>
        <h2 style={styles.title}>Privacy Dashboard</h2>
        <p style={styles.subtitle}>Your anonymous account overview</p>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.totalData}</h3>
            <p style={styles.statLabel}>Encrypted Data Items</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.totalShares}</h3>
            <p style={styles.statLabel}>Active Shares</p>
          </div>
        </div>

        {stats.anonymousId && (
          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Your Anonymous Identity</h3>
            <div style={styles.infoCard}>
              <div style={styles.infoRow}>
                <strong>Anonymous ID:</strong>
                <span style={styles.infoValue}>{stats.anonymousId}</span>
                <button
                  onClick={() => copyToClipboard(stats.anonymousId)}
                  style={styles.copyButton}
                >
                  Copy
                </button>
              </div>
              <div style={styles.infoRow}>
                <strong>Public Key:</strong>
                <span style={styles.infoValue}>{stats.publicKey}</span>
                <button
                  onClick={() => copyToClipboard(localStorage.getItem('publicKey'))}
                  style={styles.copyButton}
                >
                  Copy Full
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.featuresSection}>
          <h3 style={styles.sectionTitle}>Privacy Features Active</h3>
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>Quantum-Resistant Encryption</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>Zero-Knowledge Architecture</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>Anonymous Sharing</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>End-to-End Encryption</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>No Identity Tracking</span>
            </div>
          </div>
        </div>

        <div style={styles.securityNote}>
          <h4>🔒 Security Reminder</h4>
          <p>
            Your passphrase is the only way to access your encrypted data. 
            If you lose it, your data cannot be recovered. Keep it safe and secure.
          </p>
        </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    padding: '30px',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#00ff41',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  statNumber: {
    fontSize: '3rem',
    margin: '0 0 10px 0',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '1rem',
    opacity: 0.9,
  },
  infoSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '15px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
  },
  infoCard: {
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    padding: '20px',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  infoValue: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.9rem',
    color: 'rgba(0, 255, 65, 0.9)',
    flex: 1,
    wordBreak: 'break-all',
  },
  copyButton: {
    padding: '6px 12px',
    background: 'transparent',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s',
  },
  featuresSection: {
    marginBottom: '30px',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  checkmark: {
    color: '#00ff41',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textShadow: '0 0 10px #00ff41',
  },
  securityNote: {
    background: 'rgba(255, 0, 64, 0.1)',
    border: '1px solid #ff0040',
    padding: '20px',
    borderRadius: '4px',
    marginTop: '30px',
    color: '#ff0040',
    fontFamily: "'Share Tech Mono', monospace",
    textShadow: '0 0 10px #ff0040',
  },
};

export default PrivacyDashboard;

