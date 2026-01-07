import { create } from 'ipfs-http-client';

// IPFS client configuration
const IPFS_API_URL = import.meta.env.VITE_IPFS_API_URL || 'https://ipfs.infura.io:5001/api/v0';
const IPFS_PROJECT_ID = import.meta.env.VITE_IPFS_PROJECT_ID || '';
const IPFS_PROJECT_SECRET = import.meta.env.VITE_IPFS_PROJECT_SECRET || '';

class IPFSService {
  constructor() {
    this.ipfs = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const auth = IPFS_PROJECT_ID && IPFS_PROJECT_SECRET
        ? `Basic ${btoa(`${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`)}`
        : undefined;

      this.ipfs = create({
        url: IPFS_API_URL,
        headers: auth ? { authorization: auth } : undefined
      });

      const version = await this.ipfs.version();
      console.log('IPFS connected:', version);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize IPFS:', error);
      // Fallback
      this.ipfs = create({
        url: 'https://ipfs.infura.io:5001/api/v0'
      });
      this.initialized = true;
    }
  }

  async uploadData(data) {
    await this.initialize();
    
    try {
      const dataBuffer = new TextEncoder().encode(
        typeof data === 'string' ? data : JSON.stringify(data)
      );
      
      const result = await this.ipfs.add(dataBuffer, {
        pin: true,
        cidVersion: 1
      });

      return {
        cid: result.cid.toString(),
        path: result.path,
        size: result.size
      };
    } catch (error) {
      throw new Error('Failed to upload to IPFS: ' + error.message);
    }
  }

  async retrieveData(cid) {
    await this.initialize();
    
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      
      const data = new TextDecoder().decode(
        new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))
      );
      return data;
    } catch (error) {
      throw new Error('Failed to retrieve from IPFS: ' + error.message);
    }
  }

  getGatewayURL(cid, gateway = 'https://ipfs.io/ipfs/') {
    return `${gateway}${cid}`;
  }
}

export default new IPFSService();

