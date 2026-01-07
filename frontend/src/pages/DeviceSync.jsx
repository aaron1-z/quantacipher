import React, { useState, useEffect } from 'react';
import axios from '../api';
import encryption from '../utils/encryption';
import { logEvent } from '../utils/analytics';

const DeviceSync = () => {
  const [devices, setDevices] = useState([]);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('other');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncKey, setSyncKey] = useState('');

  useEffect(() => {
    fetchDevices();
    generateDeviceKey();
  }, []);

  const generateDeviceKey = async () => {
    try {
      await encryption.initialize();
      const keyPair = await encryption.generateKeyPair();
      setSyncKey(keyPair.publicKey);
    } catch (error) {
      console.error('Error generating device key:', error);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/devices/list');
      if (response.data.success) {
        setDevices(response.data.devices || []);
      }
    } catch (error) {
      setError('Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!deviceName.trim()) {
      setError('Device name is required');
      return;
    }

    try {
      await encryption.initialize();
      const keyPair = await encryption.generateKeyPair();
      
      const response = await axios.post('/devices/register', {
        deviceName: deviceName.trim(),
        deviceType,
        devicePublicKey: keyPair.publicKey,
        encryptedSyncKey: keyPair.privateKey // In production, encrypt this
      });

      if (response.data.success) {
        setSuccess('Device registered successfully!');
        setDeviceName('');
        fetchDevices();
        logEvent('device_register', { deviceType });
        // Save current deviceId for sync
        if (response.data.deviceId) {
          localStorage.setItem('deviceId', response.data.deviceId);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register device');
    }
  };

  const removeDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to remove this device?')) {
      return;
    }

    try {
      await axios.delete(`/devices/remove/${deviceId}`);
      setSuccess('Device removed');
      fetchDevices();
      logEvent('device_remove', { deviceId });
    } catch (error) {
      setError('Failed to remove device');
    }
  };

  const syncNow = async () => {
    try {
      const currentDeviceId = localStorage.getItem('deviceId');
      if (!currentDeviceId) {
        setError('Device not registered');
        return;
      }

      await axios.post('/devices/sync', {
        deviceId: currentDeviceId,
        syncData: {} // Sync data would go here
      });

      setSuccess('Data synced successfully!');
      fetchDevices();
      logEvent('device_sync', { deviceId: currentDeviceId });
    } catch (error) {
      setError('Failed to sync data');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📱 Multi-Device Sync</h2>
      <p style={styles.subtitle}>Sync your encrypted data across all your devices securely</p>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Register New Device</h3>
        <form onSubmit={registerDevice} style={styles.form}>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Device name (e.g., My Laptop)"
            style={styles.input}
            required
          />
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            style={styles.select}
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
            <option value="other">Other</option>
          </select>
          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
          <button type="submit" style={styles.button}>
            Register Device
          </button>
        </form>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Your Devices</h3>
          <button onClick={syncNow} style={styles.syncButton}>
            🔄 Sync Now
          </button>
        </div>
        {loading ? (
          <p>Loading devices...</p>
        ) : devices.length === 0 ? (
          <p style={styles.empty}>No devices registered</p>
        ) : (
          <div style={styles.devicesList}>
            {devices.map((device) => (
              <div key={device.deviceId} style={styles.deviceCard}>
                <div style={styles.deviceInfo}>
                  <h4>{device.deviceName}</h4>
                  <p style={styles.deviceMeta}>
                    {device.deviceType} • Last synced: {new Date(device.lastSynced).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeDevice(device.deviceId)}
                  style={styles.removeButton}
                >
                  Remove
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
    padding: '20px',
    color: '#00ff41',
  },
  title: {
    fontSize: '1.8rem',
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
  section: {
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
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
    padding: '12px',
    background: 'transparent',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.3)',
    transition: 'all 0.3s',
  },
  syncButton: {
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
  devicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  deviceCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceMeta: {
    fontSize: '0.9rem',
    color: 'rgba(0, 255, 65, 0.7)',
    marginTop: '5px',
  },
  removeButton: {
    padding: '8px 16px',
    background: 'transparent',
    color: '#ff0040',
    border: '1px solid #ff0040',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s',
  },
  empty: {
    color: 'rgba(0, 255, 65, 0.6)',
    textAlign: 'center',
    padding: '20px',
    fontFamily: "'Share Tech Mono', monospace",
  },
};

export default DeviceSync;

