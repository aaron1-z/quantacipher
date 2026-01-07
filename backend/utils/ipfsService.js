const fs = require('fs').promises;
const axios = require('axios');

// IPFS configuration - Using Pinata
const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || '';
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
const PINATA_API_URL = 'https://api.pinata.cloud';

// Fallback: Can use local node or other IPFS gateway
const IPFS_API_URL = process.env.IPFS_API_URL || '';
const USE_PINATA = PINATA_API_KEY && PINATA_SECRET_KEY;

class IPFSService {
  constructor() {
    this.ipfs = null;
    this.initialized = false;
    this.ipfsModule = null;
    this.usePinata = USE_PINATA;
  }

  async initialize() {
    if (this.initialized) return;

    if (this.usePinata) {
      // Using Pinata API
      console.log('IPFS: Using Pinata service');
      this.initialized = true;
      return;
    }

    // Fallback to ipfs-http-client for local node or other providers
    try {
      if (!this.ipfsModule) {
        this.ipfsModule = await import('ipfs-http-client');
      }
      const { create } = this.ipfsModule;

      const url = IPFS_API_URL || 'https://ipfs.infura.io:5001/api/v0';
      this.ipfs = create({ url });

      // Test connection
      const version = await this.ipfs.version();
      console.log('IPFS connected:', version);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize IPFS:', error.message);
      this.initialized = true; // Continue anyway
    }
  }

  // Upload data to IPFS
  async uploadData(data) {
    await this.initialize();
    
    try {
      if (this.usePinata) {
        // Use Pinata API - Pin JSON directly
        const dataToPin = typeof data === 'string' ? data : JSON.stringify(data);
        
        const pinataMetadata = {
          name: `quantacipher-${Date.now()}`,
          keyvalues: {
            app: 'quantacipher',
            timestamp: Date.now().toString()
          }
        };
        
        const pinataOptions = {
          cidVersion: 1
        };

        // Parse data if it's a string, otherwise use as-is
        let pinataContent;
        if (typeof data === 'string') {
          try {
            pinataContent = JSON.parse(dataToPin);
          } catch (e) {
            // If not valid JSON, wrap it
            pinataContent = { data: dataToPin };
          }
        } else {
          pinataContent = data;
        }

        const response = await axios.post(
          `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
          {
            pinataContent: pinataContent,
            pinataMetadata: pinataMetadata,
            pinataOptions: pinataOptions
          },
          {
            headers: {
              'pinata_api_key': PINATA_API_KEY,
              'pinata_secret_api_key': PINATA_SECRET_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        return {
          cid: response.data.IpfsHash,
          path: response.data.IpfsHash,
          size: Buffer.from(dataToPin).length
        };
      } else {
        // Use ipfs-http-client (local node or other provider)
        if (!this.ipfs) {
          throw new Error('IPFS client not initialized');
        }
        
        const dataBuffer = Buffer.from(typeof data === 'string' ? data : JSON.stringify(data));
        
        const result = await this.ipfs.add(dataBuffer, {
          pin: true,
          cidVersion: 1
        });

        return {
          cid: result.cid.toString(),
          path: result.path,
          size: result.size
        };
      }
    } catch (error) {
      throw new Error('Failed to upload to IPFS: ' + error.message);
    }
  }

  // Upload encrypted data
  async uploadEncryptedData(encryptedData) {
    return this.uploadData(encryptedData);
  }

  // Retrieve data from IPFS
  async retrieveData(cid) {
    await this.initialize();
    
    try {
      if (this.usePinata) {
        // Use Pinata gateway
        const gatewayUrl = `${PINATA_GATEWAY}${cid}`;
        const response = await axios.get(gatewayUrl, {
          responseType: 'text',
          timeout: 30000
        });
        return response.data;
      } else {
        // Use ipfs-http-client
        if (!this.ipfs) {
          throw new Error('IPFS client not initialized');
        }
        
        const chunks = [];
        for await (const chunk of this.ipfs.cat(cid)) {
          chunks.push(chunk);
        }
        
        const data = Buffer.concat(chunks);
        return data.toString();
      }
    } catch (error) {
      throw new Error('Failed to retrieve from IPFS: ' + error.message);
    }
  }

  // Pin content (ensure it stays available)
  async pinContent(cid) {
    await this.initialize();
    
    try {
      if (this.usePinata) {
        // Pinata automatically pins when uploading, but we can pin by hash
        const response = await axios.post(
          `${PINATA_API_URL}/pinning/pinByHash`,
          {
            hashToPin: cid,
            pinataMetadata: {
              name: `quantacipher-pin-${Date.now()}`,
              keyvalues: {
                app: 'quantacipher'
              }
            }
          },
          {
            headers: {
              'pinata_api_key': PINATA_API_KEY,
              'pinata_secret_api_key': PINATA_SECRET_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        return { success: true, cid };
      } else {
        if (!this.ipfs) {
          throw new Error('IPFS client not initialized');
        }
        await this.ipfs.pin.add(cid);
        return { success: true, cid };
      }
    } catch (error) {
      throw new Error('Failed to pin content: ' + error.message);
    }
  }

  // Unpin content
  async unpinContent(cid) {
    await this.initialize();
    
    try {
      if (this.usePinata) {
        // Unpin from Pinata
        await axios.delete(
          `${PINATA_API_URL}/pinning/unpin/${cid}`,
          {
            headers: {
              'pinata_api_key': PINATA_API_KEY,
              'pinata_secret_api_key': PINATA_SECRET_KEY
            }
          }
        );
        return { success: true, cid };
      } else {
        if (!this.ipfs) {
          throw new Error('IPFS client not initialized');
        }
        await this.ipfs.pin.rm(cid);
        return { success: true, cid };
      }
    } catch (error) {
      throw new Error('Failed to unpin content: ' + error.message);
    }
  }

  // Get IPFS gateway URL
  getGatewayURL(cid, gateway = null) {
    if (gateway) {
      return `${gateway}${cid}`;
    }
    // Use Pinata gateway if configured, otherwise public gateway
    return this.usePinata 
      ? `${PINATA_GATEWAY}${cid}`
      : `https://ipfs.io/ipfs/${cid}`;
  }

  // Check if content exists
  async contentExists(cid) {
    await this.initialize();
    
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
        if (chunks.length > 0) return true; // Content exists
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Get content stats
  async getContentStats(cid) {
    await this.initialize();
    
    try {
      const stats = await this.ipfs.files.stat(`/ipfs/${cid}`);
      return {
        cid,
        size: stats.cumulativeSize,
        type: stats.type
      };
    } catch (error) {
      throw new Error('Failed to get content stats: ' + error.message);
    }
  }
}

module.exports = new IPFSService();

