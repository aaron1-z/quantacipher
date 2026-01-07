import React, { useState, useEffect } from 'react';
import axios from '../api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/analytics/user');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Privacy Analytics</h2>
      <p style={styles.subtitle}>
        Your usage statistics - completely anonymous, no personal data stored
      </p>

      {analytics && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{analytics.totalEvents}</h3>
              <p style={styles.statLabel}>Total Events</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>
                {analytics.eventTypes?.length || 0}
              </h3>
              <p style={styles.statLabel}>Event Types</p>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Event Breakdown</h3>
            <div style={styles.eventsList}>
              {analytics.eventTypes?.map((event) => (
                <div key={event._id} style={styles.eventItem}>
                  <div style={styles.eventInfo}>
                    <strong>{event._id.replace(/_/g, ' ').toUpperCase()}</strong>
                    <span style={styles.eventCount}>{event.count} events</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${(event.count / analytics.totalEvents) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Daily Activity (Last 30 Days)</h3>
            <div style={styles.dailyActivity}>
              {analytics.dailyActivity?.map((day) => (
                <div key={day._id} style={styles.dayItem}>
                  <span style={styles.dayDate}>{day._id}</span>
                  <div style={styles.dayBar}>
                    <div
                      style={{
                        ...styles.dayBarFill,
                        width: `${(day.count / Math.max(...analytics.dailyActivity.map(d => d.count))) * 100}%`
                      }}
                    />
                  </div>
                  <span style={styles.dayCount}>{day.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Device Distribution</h3>
            <div style={styles.deviceList}>
              {analytics.deviceDistribution?.map((device) => (
                <div key={device._id} style={styles.deviceItem}>
                  <span>{device._id.toUpperCase()}</span>
                  <span style={styles.deviceCount}>{device.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.privacyNote}>
            <strong>🔒 Privacy Note:</strong> All analytics are completely anonymous. 
            No personal data, IP addresses, or identifying information is stored. 
            Data is automatically deleted after 90 days.
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    padding: '25px',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#00ff41',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  statNumber: {
    fontSize: '2.5rem',
    margin: '0 0 10px 0',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '1rem',
    opacity: 0.9,
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
  },
  eventsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  eventItem: {
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  eventInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  eventCount: {
    color: '#00ff41',
    fontWeight: '600',
    textShadow: '0 0 5px #00ff41',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#00ff41',
    boxShadow: '0 0 10px #00ff41',
    transition: 'width 0.3s',
  },
  dailyActivity: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dayItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  dayDate: {
    width: '100px',
    fontSize: '0.9rem',
    color: 'rgba(0, 255, 65, 0.8)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  dayBar: {
    flex: 1,
    height: '20px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  dayBarFill: {
    height: '100%',
    background: '#00ff41',
    boxShadow: '0 0 10px #00ff41',
    transition: 'width 0.3s',
  },
  dayCount: {
    width: '40px',
    textAlign: 'right',
    fontSize: '0.9rem',
    color: 'rgba(0, 255, 65, 0.8)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  deviceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  deviceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '4px',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  deviceCount: {
    color: '#00ff41',
    fontWeight: '600',
    textShadow: '0 0 5px #00ff41',
  },
  privacyNote: {
    padding: '15px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: '#00ff41',
    marginTop: '20px',
    fontFamily: "'Share Tech Mono', monospace",
    textShadow: '0 0 5px #00ff41',
  },
  error: {
    color: '#ff0040',
    textShadow: '0 0 10px #ff0040',
    fontFamily: "'Share Tech Mono', monospace",
  },
};

export default Analytics;

