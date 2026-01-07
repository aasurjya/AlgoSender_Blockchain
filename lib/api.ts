export interface SendTransactionRequest {
  mnemonic?: string;
  privateKey?: string;
  recipientAddress: string;
  amount: number;
  note?: string;
}

export interface Transaction {
  _id: string;
  txId: string;
  from: string;
  to: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  note?: string;
  confirmedRound?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  failed: number;
  totalAlgoSent: number;
  successRate: string;
}

const API_BASE_URL = '/api';

async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  return response.json();
}

export const algorandApi = {
  sendTransaction: async (data: SendTransactionRequest) => {
    return fetchApi('/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTransactionStatus: async (txId: string) => {
    return fetchApi(`/status/${txId}`);
  },

  getAllTransactions: async (params?: { status?: string; limit?: number; skip?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    const query = searchParams.toString();
    return fetchApi(`/transactions${query ? `?${query}` : ''}`);
  },

  getStats: async () => {
    return fetchApi('/stats');
  },

  generateMnemonic: async (): Promise<{ success: boolean; data: { mnemonic: string; address: string } }> => {
    return fetchApi('/generate-mnemonic');
  },

  deriveAddress: async (mnemonic: string): Promise<{ success: boolean; data: { address: string } }> => {
    return fetchApi('/derive-address', {
      method: 'POST',
      body: JSON.stringify({ mnemonic }),
    });
  },

  getBalance: async (address: string): Promise<{ success: boolean; data: { balance: number; address: string } }> => {
    return fetchApi(`/balance/${address}`);
  },
};

export default algorandApi;
