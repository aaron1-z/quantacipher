const axios = require('axios');

// Blockchain RPC configuration - Using Infura
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || '';
const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET || '';
const INFURA_NETWORK = process.env.INFURA_NETWORK || 'mainnet'; // mainnet, goerli, sepolia, etc.
const INFURA_CHAIN = process.env.INFURA_CHAIN || 'polygon'; // default to Polygon

// Supported networks
const INFURA_NETWORKS = {
  ethereum: {
    mainnet: 'https://mainnet.infura.io/v3',
    goerli: 'https://goerli.infura.io/v3',
    sepolia: 'https://sepolia.infura.io/v3'
  },
  polygon: {
    mainnet: 'https://polygon-mainnet.infura.io/v3',
    mumbai: 'https://polygon-mumbai.infura.io/v3'
  },
  arbitrum: {
    mainnet: 'https://arbitrum-mainnet.infura.io/v3',
    goerli: 'https://arbitrum-goerli.infura.io/v3'
  },
  optimism: {
    mainnet: 'https://optimism-mainnet.infura.io/v3',
    goerli: 'https://optimism-goerli.infura.io/v3'
  }
};

class BlockchainService {
  constructor() {
    this.projectId = INFURA_PROJECT_ID;
    this.projectSecret = INFURA_PROJECT_SECRET;
    this.network = INFURA_NETWORK;
    this.chain = INFURA_CHAIN; // Default chain (Polygon for your setup)
  }

  // Get RPC URL for a specific chain and network
  getRPCUrl(chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    if (!this.projectId) {
      throw new Error('Infura Project ID not configured');
    }

    const chainNetworks = INFURA_NETWORKS[chain];
    if (!chainNetworks) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    const baseUrl = chainNetworks[network];
    if (!baseUrl) {
      throw new Error(`Unsupported network: ${network} for chain: ${chain}`);
    }

    // Add authentication if secret is provided
    const auth = this.projectSecret 
      ? `${this.projectId}:${this.projectSecret}@`
      : `${this.projectId}@`;
    
    return `${baseUrl}/${this.projectId}`;
  }

  // Make RPC call
  async call(method, params = [], chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    try {
      const rpcUrl = this.getRPCUrl(chain, network);
      
      const response = await axios.post(
        rpcUrl,
        {
          jsonrpc: '2.0',
          method: method,
          params: params,
          id: 1
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message || 'RPC call failed');
      }

      return response.data.result;
    } catch (error) {
      throw new Error(`Blockchain RPC call failed: ${error.message}`);
    }
  }

  // Get block number
  async getBlockNumber(chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    return this.call('eth_blockNumber', [], chain, network);
  }

  // Get balance
  async getBalance(address, chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    return this.call('eth_getBalance', [address, 'latest'], chain, network);
  }

  // Get transaction
  async getTransaction(txHash, chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    return this.call('eth_getTransactionByHash', [txHash], chain, network);
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash, chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    return this.call('eth_getTransactionReceipt', [txHash], chain, network);
  }

  // Send raw transaction
  async sendRawTransaction(signedTx, chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    return this.call('eth_sendRawTransaction', [signedTx], chain, network);
  }

  // Estimate gas
  async estimateGas(transaction, chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    return this.call('eth_estimateGas', [transaction], chain, network);
  }

  // Get gas price
  async getGasPrice(chain = this.chain || 'ethereum', network = this.network || 'mainnet') {
    return this.call('eth_gasPrice', [], chain, network);
  }
}

module.exports = new BlockchainService();

