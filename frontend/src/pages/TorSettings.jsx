import React, { useState, useEffect } from 'react';
import axios from '../api';

const TorSettings = () => {
  const [torStatus, setTorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ipInfo, setIpInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkTorStatus();
  }, []);

  const checkTorStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/tor/status');
      if (response.data.success) {
        setTorStatus(response.data);
        if (response.data.available && response.data.isTor) {
          getTorIP();
        }
      } else {
        setTorStatus({ available: false });
        setError('Tor is not available. Make sure Tor Browser or Tor service is running on port 9050.');
      }
    } catch (error) {
      setTorStatus({ available: false });
      setError('Failed to connect to Tor service. Make sure Tor is running.');
    } finally {
      setLoading(false);
    }
  };

  const getTorIP = async () => {
    try {
      const response = await axios.get('/tor/ip');
      if (response.data.success) {
        setIpInfo(response.data);
      }
    } catch (error) {
      console.error('Error getting Tor IP:', error);
    }
  };

  return (
    <div style={styles.container}>
        <h2 style={styles.title}>🔒 Tor Network Settings</h2>
        <p style={styles.subtitle}>
          Configure Tor for network-level anonymity. All requests will be routed through the Tor network.
        </p>

        {loading ? (
          <div style={styles.statusCard}>
            <p>Checking Tor status...</p>
          </div>
        ) : (
          <>
            <div style={styles.statusCard}>
              <h3 style={styles.statusTitle}>Tor Status</h3>
              <div style={styles.statusContent}>
                <div style={styles.statusRow}>
                  <span style={styles.statusLabel}>Available:</span>
                  <span style={{
                    ...styles.statusValue,
                    color: torStatus?.available ? '#27ae60' : '#e74c3c'
                  }}>
                    {torStatus?.available ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                {torStatus?.isTor !== undefined && (
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Connected via Tor:</span>
                    <span style={{
                      ...styles.statusValue,
                      color: torStatus.isTor ? '#27ae60' : '#e74c3c'
                    }}>
                      {torStatus.isTor ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                )}
                {torStatus?.ip && (
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>IP Address:</span>
                    <span style={styles.statusValue}>{torStatus.ip}</span>
                  </div>
                )}
                {torStatus?.country && (
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Country:</span>
                    <span style={styles.statusValue}>{torStatus.country}</span>
                  </div>
                )}
              </div>
              <button onClick={checkTorStatus} style={styles.refreshButton}>
                Refresh Status
              </button>
            </div>

            {ipInfo && (
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>Current IP (via Tor)</h3>
                <p style={styles.ipAddress}>{ipInfo.ip}</p>
                <p style={styles.ipNote}>
                  Your requests are being routed through the Tor network, 
                  providing network-level anonymity.
                </p>
              </div>
            )}

            {error && (
              <div style={styles.errorCard}>
                <h4>⚠️ Setup Required</h4>
                <p>{error}</p>
                <div style={styles.instructions}>
                  <h5>How to enable Tor:</h5>
                  <ol style={styles.instructionsOl}>
                    <li style={styles.instructionsLi}>Install Tor Browser or Tor service</li>
                    <li style={styles.instructionsLi}>Start Tor (default SOCKS5 proxy: 127.0.0.1:9050)</li>
                    <li style={styles.instructionsLi}>Refresh this page</li>
                  </ol>
                  <p style={styles.note}>
                    <strong>Note:</strong> Tor Browser automatically sets up the proxy. 
                    For standalone Tor, ensure it's running on port 9050.
                  </p>
                </div>
              </div>
            )}

            <div style={styles.featuresCard}>
              <h3 style={styles.featuresTitle}>Tor Benefits</h3>
              <ul style={styles.featuresList}>
                <li style={styles.featuresListItem}>✓ Network-level anonymity</li>
                <li style={styles.featuresListItem}>✓ Hide your IP address</li>
                <li style={styles.featuresListItem}>✓ Encrypted traffic routing</li>
                <li style={styles.featuresListItem}>✓ Bypass network restrictions</li>
                <li style={styles.featuresListItem}>✓ Prevent traffic analysis</li>
              </ul>
            </div>
          </>
        )}
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
  statusCard: {
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    padding: '25px',
    borderRadius: '4px',
    marginBottom: '20px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  statusTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
  },
  statusContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
  },
  statusLabel: {
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.8)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  statusValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#00ff41',
    textShadow: '0 0 5px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  refreshButton: {
    padding: '12px 24px',
    background: 'transparent',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.3)',
    transition: 'all 0.3s',
  },
  infoCard: {
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    padding: '20px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
  },
  infoTitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
  },
  ipAddress: {
    fontSize: '1.5rem',
    fontFamily: "'Share Tech Mono', monospace",
    color: '#00ff41',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '0 0 10px #00ff41',
  },
  ipNote: {
    fontSize: '0.9rem',
    color: 'rgba(0, 255, 65, 0.8)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  errorCard: {
    background: 'rgba(255, 0, 64, 0.1)',
    border: '1px solid #ff0040',
    padding: '20px',
    borderRadius: '4px',
    marginBottom: '20px',
    boxShadow: '0 0 20px rgba(255, 0, 64, 0.3)',
  },
  instructions: {
    marginTop: '15px',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  instructionsOl: {
    marginLeft: '20px',
    marginTop: '10px',
    color: 'rgba(0, 255, 65, 0.9)',
  },
  instructionsLi: {
    marginBottom: '8px',
    color: 'rgba(0, 255, 65, 0.9)',
  },
  note: {
    marginTop: '15px',
    fontSize: '0.9rem',
    color: 'rgba(0, 255, 65, 0.8)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  featuresCard: {
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    padding: '25px',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  featuresTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featuresListItem: {
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    marginBottom: '8px',
    borderRadius: '4px',
    fontSize: '1rem',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
};

export default TorSettings;

