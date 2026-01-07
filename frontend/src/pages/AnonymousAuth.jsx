import React, { useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import encryption from '../utils/encryption';
import QRCode from 'qrcode';

const AnonymousAuth = () => {
  const [mode, setMode] = useState('create'); // 'create' or 'login'
  const [anonymousId, setAnonymousId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountData, setAccountData] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passphrase.length < 12) {
      setError('Passphrase must be at least 12 characters long');
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/anonymous/create', { passphrase });
      
      if (response.data.success) {
        setAccountData(response.data);
        setSuccess('Anonymous account created! Save your credentials securely.');
        
        // Generate QR code with account info
        const accountInfo = {
          anonymousId: response.data.anonymousId,
          publicKey: response.data.publicKey,
          note: 'Save this QR code securely. Scan to recover your account.'
        };
        const qr = await QRCode.toDataURL(JSON.stringify(accountInfo));
        setQrCode(qr);
        
        // Store encrypted keys locally
        localStorage.setItem('jwtToken', response.data.token);
        localStorage.setItem('anonymousId', response.data.anonymousId);
        localStorage.setItem('publicKey', response.data.publicKey);
        localStorage.setItem('encryptedPrivateKey', response.data.encryptedPrivateKey);
        localStorage.setItem('encryptedMasterKey', response.data.encryptedMasterKey);
        
        // Store passphrase in sessionStorage (not localStorage for security)
        sessionStorage.setItem('passphrase', passphrase);
        
        // Start countdown timer (15 seconds)
        let countdown = 15;
        setRedirectCountdown(countdown);
        
        const countdownInterval = setInterval(() => {
          countdown--;
          setRedirectCountdown(countdown);
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            navigate('/');
          }
        }, 1000);
        
        // Store interval ID to allow manual cancellation
        setTimeout(() => {
          clearInterval(countdownInterval);
        }, 15000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create anonymous account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!anonymousId || !passphrase) {
      setError('Anonymous ID and passphrase are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/anonymous/login', { anonymousId, passphrase });
      
      if (response.data.success) {
        localStorage.setItem('jwtToken', response.data.token);
        localStorage.setItem('anonymousId', response.data.anonymousId);
        localStorage.setItem('publicKey', response.data.publicKey);
        sessionStorage.setItem('passphrase', passphrase);
        
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.download = `quantacipher-${anonymousId || accountData?.anonymousId}.png`;
      link.href = qrCode;
      link.click();
    }
  };

  const handleContinue = () => {
    setRedirectCountdown(null);
    navigate('/');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>
          {mode === 'create' ? 'Create Anonymous Account' : 'Login Anonymously'}
        </h2>
        <p style={styles.subtitle}>
          {mode === 'create' 
            ? 'No email, no username, no identity. Just pure privacy.'
            : 'Access your anonymous account'}
        </p>

        <div style={styles.modeToggle}>
          <button
            onClick={() => setMode('create')}
            style={mode === 'create' ? styles.activeButton : styles.toggleButton}
          >
            Create
          </button>
          <button
            onClick={() => setMode('login')}
            style={mode === 'login' ? styles.activeButton : styles.toggleButton}
          >
            Login
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreateAccount} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Passphrase (min 12 characters)</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Create a strong passphrase"
                style={styles.input}
                required
                minLength={12}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Passphrase</label>
              <input
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Confirm your passphrase"
                style={styles.input}
                required
                minLength={12}
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            <button
              type="submit"
              style={isSubmitting ? styles.buttonSubmitting : styles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Anonymous Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Anonymous ID</label>
              <input
                type="text"
                value={anonymousId}
                onChange={(e) => setAnonymousId(e.target.value)}
                placeholder="Your anonymous ID"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Passphrase</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Your passphrase"
                style={styles.input}
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
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {accountData && (
          <div style={styles.accountInfo}>
            <h3 style={styles.infoTitle}>⚠️ Save These Credentials Securely!</h3>
            <p style={styles.warningText}>
              <strong>IMPORTANT:</strong> Save these credentials now! You won't be able to recover your account without them.
            </p>
            
            {redirectCountdown !== null && (
              <div style={styles.countdownBox}>
                <p style={styles.countdownText}>
                  Redirecting in <strong style={styles.countdownNumber}>{redirectCountdown}</strong> seconds...
                </p>
                <button onClick={handleContinue} style={styles.continueButton}>
                  Continue Now
                </button>
              </div>
            )}
            
            <div style={styles.credentialBox}>
              <div style={styles.credentialItem}>
                <label style={styles.credentialLabel}>Anonymous ID:</label>
                <div style={styles.credentialValue}>
                  <code style={styles.code}>{accountData.anonymousId}</code>
                  <button 
                    onClick={() => copyToClipboard(accountData.anonymousId)}
                    style={styles.copyButton}
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              
              <div style={styles.credentialItem}>
                <label style={styles.credentialLabel}>Passphrase:</label>
                <div style={styles.credentialValue}>
                  <code style={styles.code}>{passphrase || '***'}</code>
                  <button 
                    onClick={() => copyToClipboard(passphrase)}
                    style={styles.copyButton}
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              
              {accountData.passphrase && (
                <div style={styles.credentialItem}>
                  <label style={styles.credentialLabel}>Generated Passphrase:</label>
                  <div style={styles.credentialValue}>
                    <code style={styles.code}>{accountData.passphrase}</code>
                    <button 
                      onClick={() => copyToClipboard(accountData.passphrase)}
                      style={styles.copyButton}
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p style={styles.warning}>
                    <small>⚠️ Save this! You won't see it again.</small>
                  </p>
                </div>
              )}
            </div>
            
            {qrCode && (
              <div style={styles.qrSection}>
                <p style={styles.qrTitle}>QR Code Backup:</p>
                <img src={qrCode} alt="Account QR Code" style={styles.qrCode} />
                <button onClick={downloadQRCode} style={styles.downloadButton}>
                  📥 Download QR Code
                </button>
                <p style={styles.qrNote}>
                  Scan this QR code to recover your account on another device
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#000000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    color: '#00ff41',
  },
  container: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 30px rgba(0, 255, 65, 0.1)',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '10px',
    color: '#00ff41',
    textAlign: 'center',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '700',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.8)',
    textAlign: 'center',
    marginBottom: '30px',
    fontFamily: "'Share Tech Mono', monospace",
  },
  modeToggle: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  toggleButton: {
    flex: 1,
    padding: '12px',
    background: 'transparent',
    border: '1px solid rgba(0, 255, 65, 0.5)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.7)',
    fontFamily: "'Share Tech Mono', monospace",
    transition: 'all 0.3s',
  },
  activeButton: {
    flex: 1,
    padding: '12px',
    background: 'rgba(0, 255, 65, 0.1)',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: "'Share Tech Mono', monospace",
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.3)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
    transition: 'all 0.3s',
    fontFamily: "'Share Tech Mono', monospace",
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
    transition: 'all 0.3s',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
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
    textAlign: 'center',
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
    textAlign: 'center',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
    padding: '10px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
  },
  accountInfo: {
    marginTop: '30px',
    padding: '25px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #00ff41',
    borderRadius: '8px',
    boxShadow: '0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 20px rgba(0, 255, 65, 0.1)',
  },
  infoTitle: {
    fontSize: '1.5rem',
    marginBottom: '15px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '700',
  },
  warningText: {
    color: '#ff0040',
    fontSize: '1rem',
    marginBottom: '20px',
    padding: '12px',
    background: 'rgba(255, 0, 64, 0.1)',
    border: '1px solid #ff0040',
    borderRadius: '4px',
    textShadow: '0 0 10px #ff0040',
    fontFamily: "'Share Tech Mono', monospace",
  },
  countdownBox: {
    marginBottom: '20px',
    padding: '15px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    textAlign: 'center',
  },
  countdownText: {
    color: '#00ff41',
    fontSize: '1rem',
    marginBottom: '10px',
    fontFamily: "'Share Tech Mono', monospace",
  },
  countdownNumber: {
    fontSize: '1.5rem',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41',
    fontFamily: "'Orbitron', monospace",
  },
  continueButton: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.3)',
    transition: 'all 0.3s',
  },
  credentialBox: {
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(0, 255, 65, 0.5)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  credentialItem: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
  },
  credentialLabel: {
    fontSize: '0.9rem',
    color: '#00ff41',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block',
    textShadow: '0 0 5px #00ff41',
  },
  credentialValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  code: {
    flex: 1,
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
    color: '#00ff41',
    fontSize: '0.95rem',
    wordBreak: 'break-all',
    fontFamily: "'Courier New', monospace",
    minWidth: '200px',
  },
  copyButton: {
    padding: '8px 15px',
    background: 'rgba(0, 255, 65, 0.1)',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: "'Share Tech Mono', monospace",
    transition: 'all 0.3s',
    textShadow: '0 0 5px #00ff41',
  },
  warning: {
    color: '#ff0040',
    marginTop: '10px',
    textShadow: '0 0 10px #ff0040',
    fontFamily: "'Share Tech Mono', monospace",
  },
  qrSection: {
    textAlign: 'center',
    marginTop: '20px',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '8px',
  },
  qrTitle: {
    fontSize: '1rem',
    color: '#00ff41',
    marginBottom: '15px',
    fontFamily: "'Share Tech Mono', monospace",
    fontWeight: '600',
  },
  qrCode: {
    maxWidth: '250px',
    width: '100%',
    marginBottom: '15px',
    border: '2px solid #00ff41',
    borderRadius: '8px',
    padding: '15px',
    background: '#fff',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
  },
  qrNote: {
    fontSize: '0.85rem',
    color: 'rgba(0, 255, 65, 0.7)',
    marginTop: '10px',
    fontFamily: "'Share Tech Mono', monospace",
  },
  downloadButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.3), 0 0 30px rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s',
    fontSize: '0.9rem',
  },
};

export default AnonymousAuth;

