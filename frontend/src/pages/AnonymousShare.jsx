import React, { useState, useEffect } from 'react';
import axios from '../api';
import encryption from '../utils/encryption';
import QRCode from 'qrcode';
import { logEvent } from '../utils/analytics';

const AnonymousShare = () => {
  const [data, setData] = useState('');
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
  const [shareType, setShareType] = useState('direct');
  const [expiresIn, setExpiresIn] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareId, setShareId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [myShares, setMyShares] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyShares();
  }, []);

  const fetchMyShares = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/share/my-shares');
      if (response.data.success) {
        setMyShares(response.data);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!data.trim()) {
      setError('Data is required');
      return;
    }

    if (shareType === 'direct' && !recipientPublicKey.trim()) {
      setError('Recipient public key is required for direct shares');
      return;
    }

    setIsSubmitting(true);
    try {
      await encryption.initialize();
      
      // Get sender's private key from localStorage (would need to decrypt with passphrase)
      const encryptedPrivateKeyStr = localStorage.getItem('encryptedPrivateKey');
      const passphrase = sessionStorage.getItem('passphrase');
      
      if (!encryptedPrivateKeyStr || !passphrase) {
        setError('Please login to share data');
        return;
      }

      // Decrypt private key (in production, this should be done more securely)
      const privateKeyData = JSON.parse(encryptedPrivateKeyStr);
      const senderPrivateKey = await encryption.decryptSymmetric(
        privateKeyData.encrypted,
        privateKeyData.nonce,
        passphrase
      );

      const shareData = {
        data,
        recipientPublicKey: shareType === 'direct' ? recipientPublicKey : null,
        shareType,
        expiresIn: expiresIn ? parseInt(expiresIn) : null,
        maxViews: maxViews ? parseInt(maxViews) : null,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        senderPrivateKey
      };

      const response = await axios.post('/share/share', shareData);
      
      if (response.data.success) {
        setShareId(response.data.shareId);
        setSuccess('Data shared anonymously!');
        logEvent('share_create', {
          shareType,
          hasRecipient: !!recipientPublicKey,
          expiresIn: shareData.expiresIn,
          maxViews: shareData.maxViews,
        });
        
        // Generate QR code with share ID
        const shareInfo = {
          shareId: response.data.shareId,
          type: shareType,
          expiresAt: response.data.expiresAt
        };
        const qr = await QRCode.toDataURL(JSON.stringify(shareInfo));
        setQrCode(qr);
        
        setData('');
        setRecipientPublicKey('');
        fetchMyShares();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to share data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetrieveShare = async (shareIdInput) => {
    setError('');
    setSuccess('');
    
    if (!shareIdInput) {
      setError('Share ID is required');
      return;
    }

    try {
      const response = await axios.get(`/share/share/${shareIdInput}`);
      
      if (response.data.success) {
        // Decrypt the data (would need recipient's private key)
        setSuccess('Share retrieved! Decrypt with your private key.');
        // In production, automatically decrypt if we have the key
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to retrieve share');
    }
  };

  const handleDeleteShare = async (shareIdToDelete) => {
    if (!window.confirm('Are you sure you want to delete this share?')) {
      return;
    }

    try {
      await axios.delete(`/share/share/${shareIdToDelete}`);
      fetchMyShares();
      setSuccess('Share deleted');
      logEvent('share_delete', { shareId: shareIdToDelete });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete share');
    }
  };

  return (
    <div style={styles.container}>
        <h2 style={styles.title}>Anonymous Share</h2>
        <p style={styles.subtitle}>
          Share information anonymously. No one knows who you are or who receives it.
        </p>

        <form onSubmit={handleShare} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Data to Share</label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter data to share anonymously"
              style={styles.textarea}
              rows={5}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Share Type</label>
            <select
              value={shareType}
              onChange={(e) => setShareType(e.target.value)}
              style={styles.select}
            >
              <option value="direct">Direct (to specific user)</option>
              <option value="public">Public (anyone with link)</option>
              <option value="temporary">Temporary (expires in 24h)</option>
            </select>
          </div>

          {shareType === 'direct' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Recipient Public Key</label>
              <input
                type="text"
                value={recipientPublicKey}
                onChange={(e) => setRecipientPublicKey(e.target.value)}
                placeholder="Recipient's public key"
                style={styles.input}
                required={shareType === 'direct'}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Expires In (seconds, optional)</label>
            <input
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              placeholder="e.g., 3600 for 1 hour"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Max Views (optional)</label>
            <input
              type="number"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="e.g., 5 for 5 views max"
              style={styles.input}
              min="1"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Time Limit (seconds, optional)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="e.g., 1800 for 30 minutes"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button
            type="submit"
            style={isSubmitting ? styles.buttonSubmitting : styles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sharing...' : 'Share Anonymously'}
          </button>
        </form>

        {shareId && (
          <div style={styles.shareResult}>
            <h3>Share Created!</h3>
            <p><strong>Share ID:</strong> {shareId}</p>
            {qrCode && (
              <div style={styles.qrSection}>
                <img src={qrCode} alt="Share QR Code" style={styles.qrCode} />
              </div>
            )}
          </div>
        )}

        <div style={styles.sharesSection}>
          <h3 style={styles.sectionTitle}>My Shares</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div style={styles.sharesList}>
                <h4>Sent ({myShares.sent.length})</h4>
                {myShares.sent.map((share) => (
                  <div key={share._id} style={styles.shareItem}>
                    <p><strong>ID:</strong> {share.shareId}</p>
                    <p><strong>Type:</strong> {share.shareType}</p>
                    <p><strong>Created:</strong> {new Date(share.createdAt).toLocaleString()}</p>
                    {share.expiresAt && (
                      <p><strong>Expires:</strong> {new Date(share.expiresAt).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => handleDeleteShare(share.shareId)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <div style={styles.sharesList}>
                <h4>Received ({myShares.received.length})</h4>
                {myShares.received.map((share) => (
                  <div key={share._id} style={styles.shareItem}>
                    <p><strong>ID:</strong> {share.shareId}</p>
                    <p><strong>Type:</strong> {share.shareType}</p>
                    <button
                      onClick={() => handleRetrieveShare(share.shareId)}
                      style={styles.retrieveButton}
                    >
                      Retrieve
                    </button>
                  </div>
                ))}
              </div>
            </>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
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
  select: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #00ff41',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#00ff41',
    fontSize: '1rem',
    fontFamily: "'Share Tech Mono', monospace",
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
  shareResult: {
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    marginBottom: '30px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  qrSection: {
    textAlign: 'center',
    marginTop: '15px',
  },
  qrCode: {
    maxWidth: '200px',
  },
  sharesSection: {
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
  sharesList: {
    marginBottom: '30px',
  },
  shareItem: {
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
    marginBottom: '10px',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  deleteButton: {
    padding: '8px 16px',
    background: 'transparent',
    color: '#ff0040',
    border: '1px solid #ff0040',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  retrieveButton: {
    padding: '8px 16px',
    background: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default AnonymousShare;

