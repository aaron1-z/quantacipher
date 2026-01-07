// src/pages/Home.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('jwtToken') !== null;
  const isAnonymous = localStorage.getItem('anonymousId') !== null;

  if (isAuthenticated) {
    // Show dashboard for authenticated users
    return (
      <div style={styles.container}>
        <div style={styles.heroSection}>
          <h1 style={styles.title}>Welcome to Quantacipher</h1>
          <p style={styles.subtitle}>
            {isAnonymous 
              ? 'Your anonymous account is active. Your identity remains hidden.'
              : 'Your secure data platform. Store, retrieve, and share with confidence.'}
          </p>
        </div>

        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionGrid}>
            <div 
              style={styles.actionCard} 
              onClick={() => navigate('/store')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.actionIcon}>💾</div>
              <h3 style={styles.actionTitle}>Store Data</h3>
              <p style={styles.actionDescription}>Encrypt and store your data securely</p>
            </div>
            <div 
              style={styles.actionCard} 
              onClick={() => navigate('/retrieve')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.actionIcon}>🔍</div>
              <h3 style={styles.actionTitle}>Retrieve Data</h3>
              <p style={styles.actionDescription}>Access your encrypted data</p>
            </div>
            <div 
              style={styles.actionCard} 
              onClick={() => navigate('/share')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.actionIcon}>🔗</div>
              <h3 style={styles.actionTitle}>Share Anonymously</h3>
              <p style={styles.actionDescription}>Share data without revealing identity</p>
            </div>
            <div 
              style={styles.actionCard} 
              onClick={() => navigate('/ipfs')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.actionIcon}>🌐</div>
              <h3 style={styles.actionTitle}>IPFS Storage</h3>
              <p style={styles.actionDescription}>Decentralized storage on IPFS</p>
            </div>
            {isAnonymous && (
              <>
                <div 
                  style={styles.actionCard} 
                  onClick={() => navigate('/privacy')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={styles.actionIcon}>🛡️</div>
                  <h3 style={styles.actionTitle}>Privacy Dashboard</h3>
                  <p style={styles.actionDescription}>Manage your anonymous identity</p>
                </div>
                <div 
                  style={styles.actionCard} 
                  onClick={() => navigate('/devices')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={styles.actionIcon}>📱</div>
                  <h3 style={styles.actionTitle}>Device Sync</h3>
                  <p style={styles.actionDescription}>Sync across multiple devices</p>
                </div>
              </>
            )}
            <div 
              style={styles.actionCard} 
              onClick={() => navigate('/analytics')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.actionIcon}>📊</div>
              <h3 style={styles.actionTitle}>Analytics</h3>
              <p style={styles.actionDescription}>View your privacy analytics</p>
            </div>
            <div 
              style={styles.actionCard} 
              onClick={() => navigate('/tor')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.actionIcon}>🔒</div>
              <h3 style={styles.actionTitle}>Tor Settings</h3>
              <p style={styles.actionDescription}>Configure network anonymity (Optional)</p>
            </div>
          </div>
        </div>

        <div style={styles.featuresSection}>
          <h2 style={styles.sectionTitle}>Features</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.feature}>
              <div style={styles.icon}>🔐</div>
              <h3 style={styles.featureTitle}>Quantum-Resistant Encryption</h3>
              <p style={styles.featureDescription}>XChaCha20-Poly1305 encryption that even quantum computers cannot break.</p>
            </div>
            <div style={styles.feature}>
              <div style={styles.icon}>👤</div>
              <h3 style={styles.featureTitle}>Complete Anonymity</h3>
              <p style={styles.featureDescription}>No email, no username, no identity tracking. Pure privacy.</p>
            </div>
            <div style={styles.feature}>
              <div style={styles.icon}>🌐</div>
              <h3 style={styles.featureTitle}>Decentralized Storage</h3>
              <p style={styles.featureDescription}>Store data on IPFS for true decentralization and immutability.</p>
            </div>
            <div style={styles.feature}>
              <div style={styles.icon}>🔗</div>
              <h3 style={styles.featureTitle}>Anonymous Sharing</h3>
              <p style={styles.featureDescription}>Share with time limits, view counts, or make it public.</p>
            </div>
            <div style={styles.feature}>
              <div style={styles.icon}>📱</div>
              <h3 style={styles.featureTitle}>Multi-Device Sync</h3>
              <p style={styles.featureDescription}>Access your data securely across all your devices.</p>
            </div>
            <div style={styles.feature}>
              <div style={styles.icon}>🔒</div>
              <h3 style={styles.featureTitle}>Tor Integration</h3>
              <p style={styles.featureDescription}>Optional Tor network support for maximum anonymity.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <h1 style={styles.title}>Welcome to Quantacipher</h1>
        <p style={styles.subtitle}>
          The world's most private data platform. Quantum-resistant encryption. 
          Complete anonymity. Your information travels, not your identity.
        </p>
        <div style={styles.buttonGroup}>
          <Link to="/anonymous" style={styles.primaryButton}>Go Anonymous</Link>
          <Link to="/register" style={styles.secondaryButton}>Traditional Signup</Link>
        </div>
      </div>
      <div style={styles.featuresSection}>
        <div style={styles.feature}>
          <div style={styles.icon}>👤</div>
          <h3 style={styles.featureTitle}>Complete Anonymity</h3>
          <p style={styles.featureDescription}>No email, no username, no identity. Just pure privacy. You stay completely hidden.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.icon}>🔐</div>
          <h3 style={styles.featureTitle}>Quantum-Resistant</h3>
          <p style={styles.featureDescription}>Even quantum computers cannot break our encryption. Your data is safe for decades to come.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.icon}>🔗</div>
          <h3 style={styles.featureTitle}>Anonymous Sharing</h3>
          <p style={styles.featureDescription}>Share information without revealing who you are. Information travels, not identities.</p>
        </div>
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
  heroSection: {
    textAlign: 'center',
    marginBottom: '50px',
    padding: '20px',
  },
  title: {
    fontSize: '3rem',
    color: '#00ff41',
    marginBottom: '20px',
    textShadow: 
      '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '700',
    letterSpacing: '3px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#00ff41',
    marginBottom: '40px',
    textShadow: '0 0 5px #00ff41',
    opacity: 0.9,
    lineHeight: '1.6',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'inline-block',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    color: '#00ff41',
    textDecoration: 'none',
    borderRadius: '8px',
    border: '2px solid #00ff41',
    transition: 'all 0.3s',
    fontSize: '1rem',
    fontWeight: '500',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '2px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3), 0 0 40px rgba(102, 126, 234, 0.2)',
    textShadow: '0 0 10px #00ff41',
  },
  secondaryButton: {
    display: 'inline-block',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.1) 0%, rgba(102, 126, 234, 0.15) 100%)',
    color: '#00ff41',
    textDecoration: 'none',
    borderRadius: '8px',
    border: '2px solid #00ff41',
    transition: 'all 0.3s',
    fontSize: '1rem',
    fontWeight: '500',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '2px',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.2), 0 0 30px rgba(118, 75, 162, 0.15)',
    textShadow: '0 0 10px #00ff41',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  featuresSection: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '50px',
    width: '100%',
    flexWrap: 'wrap',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '2rem',
    color: '#00ff41',
    marginBottom: '30px',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
    letterSpacing: '2px',
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: '50px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  actionCard: {
    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(26, 10, 46, 0.6) 50%, rgba(10, 10, 10, 0.8) 100%)',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #00ff41',
    boxShadow: `0 0 20px rgba(0, 255, 65, 0.2), 0 0 40px rgba(102, 126, 234, 0.15), inset 0 0 20px rgba(0, 255, 65, 0.05)`,
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    textAlign: 'center',
  },
  actionCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 0 30px rgba(0, 255, 65, 0.4), 0 0 60px rgba(102, 126, 234, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1)',
  },
  actionIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
  },
  actionTitle: {
    fontSize: '1.2rem',
    color: '#00ff41',
    marginBottom: '10px',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: '0.9rem',
    color: '#00ff41',
    opacity: 0.8,
    lineHeight: '1.5',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  feature: {
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(26, 10, 46, 0.6) 50%, rgba(10, 10, 10, 0.8) 100%)',
    padding: '30px',
    borderRadius: '12px',
    border: '1px solid #00ff41',
    boxShadow: `0 0 20px rgba(0, 255, 65, 0.2), 0 0 40px rgba(102, 126, 234, 0.15), inset 0 0 20px rgba(0, 255, 65, 0.05)`,
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  icon: {
    fontSize: '3rem',
    color: '#00ff41',
    marginBottom: '20px',
    filter: 'drop-shadow(0 0 10px #00ff41)',
  },
  featureTitle: {
    fontSize: '1.3rem',
    color: '#00ff41',
    marginBottom: '10px',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
    letterSpacing: '1px',
  },
  featureDescription: {
    fontSize: '0.95rem',
    color: '#00ff41',
    opacity: 0.8,
    lineHeight: '1.6',
  },
};

export default Home;
