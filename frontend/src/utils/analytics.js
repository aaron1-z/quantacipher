import axios from '../api';

// Lightweight analytics logger – privacy-aware, best-effort (errors are ignored)
export const logEvent = async (eventType, metadata = {}) => {
  try {
    await axios.post('/analytics/log', {
      eventType,
      metadata,
      deviceType: navigator.userAgent || 'unknown',
    });
  } catch {
    // Intentionally ignore analytics errors to avoid breaking UX
  }
};

export default { logEvent };


