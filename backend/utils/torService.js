const { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');

// Tor proxy configuration
// Default Tor SOCKS5 proxy runs on localhost:9050
const TOR_PROXY = process.env.TOR_PROXY || 'socks5://127.0.0.1:9050';

class TorService {
  constructor() {
    this.agent = null;
    this.isAvailable = false;
    this.checkTorAvailability();
  }

  // Check if Tor is available
  async checkTorAvailability() {
    try {
      this.agent = new SocksProxyAgent(TOR_PROXY);
      
      // Test Tor connection by making a request through it
      const testResponse = await axios.get('https://check.torproject.org/api/ip', {
        httpsAgent: this.agent,
        httpAgent: this.agent,
        timeout: 5000
      });
      
      this.isAvailable = testResponse.data.IsTor === true;
      console.log('Tor service:', this.isAvailable ? 'Available' : 'Not available');
    } catch (error) {
      this.isAvailable = false;
      console.warn('Tor not available:', error.message);
    }
  }

  // Get Tor agent for making requests
  getAgent() {
    if (!this.isAvailable) {
      throw new Error('Tor is not available. Make sure Tor is running on port 9050.');
    }
    return this.agent;
  }

  // Make a request through Tor
  async makeTorRequest(url, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Tor is not available');
    }

    const agent = this.getAgent();
    
    return axios({
      url,
      ...options,
      httpsAgent: agent,
      httpAgent: agent,
      timeout: options.timeout || 30000
    });
  }

  // Get current IP through Tor
  async getTorIP() {
    try {
      const response = await this.makeTorRequest('https://api.ipify.org?format=json');
      return {
        ip: response.data.ip,
        isTor: true
      };
    } catch (error) {
      throw new Error('Failed to get IP through Tor: ' + error.message);
    }
  }

  // Verify Tor connection
  async verifyTorConnection() {
    try {
      const response = await this.makeTorRequest('https://check.torproject.org/api/ip');
      return {
        isTor: response.data.IsTor === true,
        ip: response.data.IP,
        country: response.data.Country
      };
    } catch (error) {
      return {
        isTor: false,
        error: error.message
      };
    }
  }
}

module.exports = new TorService();

