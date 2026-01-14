// Mock API functions for Finstack dashboard
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isKYCVerified: boolean
  profilePicture?: string
}

export interface Wallet {
  id: string
  type: "NGN" | "USDT" | "USDC" | "CNGN"
  balance: number
  accountNumber?: string
  walletAddress?: string
}

export interface Transaction {
  id: string
  date: string
  type: "Deposit" | "Withdraw" | "P2P"
  wallet: "NGN" | "USDT" | "USDC" | "CNGN"
  amount: number
  status: "Pending" | "Completed" | "Failed"
  reference: string
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
}

export interface P2POffer {
  id: string
  traderName: string
  rate: number
  minLimit: number
  maxLimit: number
  currency: string
}

export interface SavedAccount {
  id: string
  label: string
  type: "bank" | "wallet"
  accountNumber?: string
  walletAddress?: string
  walletType?: "TRC20" | "ERC20" | "BEP20"
  bankName?: string
  isDefault: boolean
}

// Mock user data
export const mockUser: User = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  isKYCVerified: true,
}

// Mock wallets
export const mockWallets: Wallet[] = [
  {
    id: "1",
    type: "NGN",
    balance: 150000,
    accountNumber: "1234567890",
  },
  {
    id: "2",
    type: "USDT",
    balance: 500,
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  },
  {
    id: "3",
    type: "USDC",
    balance: 250,
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
  {
    id: "4",
    type: "CNGN",
    balance: 50000,
    walletAddress: "0xcngn1234567890abcdef1234567890abcdef1234",
  },
]

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2025-01-05",
    type: "Deposit",
    wallet: "NGN",
    amount: 50000,
    status: "Completed",
    reference: "TXN001",
  },
  {
    id: "2",
    date: "2025-01-04",
    type: "Withdraw",
    wallet: "USDT",
    amount: 100,
    status: "Completed",
    reference: "TXN002",
  },
  {
    id: "3",
    date: "2025-01-03",
    type: "P2P",
    wallet: "NGN",
    amount: 25000,
    status: "Pending",
    reference: "TXN003",
  },
  {
    id: "4",
    date: "2025-01-02",
    type: "Deposit",
    wallet: "USDT",
    amount: 200,
    status: "Completed",
    reference: "TXN004",
  },
  {
    id: "5",
    date: "2025-01-01",
    type: "Withdraw",
    wallet: "NGN",
    amount: 30000,
    status: "Failed",
    reference: "TXN005",
  },
]

// Mock exchange rates - Using live API for real-time rates
export const mockRates: ExchangeRate[] = [
  { from: "NGN", to: "RMB", rate: 0.0093 },
  { from: "RMB", to: "NGN", rate: 107 },
  { from: "NGN", to: "USDT", rate: 0.00061 }, // Will be updated with live rates
  { from: "USDT", to: "NGN", rate: 1635 }, // Will be updated with live rates
  { from: "RMB", to: "USDT", rate: 0.14 },
  { from: "USDT", to: "RMB", rate: 7.14 },
  { from: "NGN", to: "USDC", rate: 0.00061 },
  { from: "USDC", to: "NGN", rate: 1635 },
  { from: "RMB", to: "USDC", rate: 0.14 },
  { from: "USDC", to: "RMB", rate: 7.14 },
]

// Mock P2P offers
export const mockP2POffers: P2POffer[] = [
  {
    id: "1",
    traderName: "Alice Trading",
    rate: 775,
    minLimit: 10000,
    maxLimit: 500000,
    currency: "NGN",
  },
  {
    id: "2",
    traderName: "Bob Exchange",
    rate: 772,
    minLimit: 5000,
    maxLimit: 300000,
    currency: "NGN",
  },
  {
    id: "3",
    traderName: "Charlie Crypto",
    rate: 1.02,
    minLimit: 50,
    maxLimit: 1000,
    currency: "USDT",
  },
]

// Mock saved accounts
export const mockSavedAccounts: SavedAccount[] = [
  {
    id: "1",
    label: "My GTBank Account",
    type: "bank",
    accountNumber: "0123456789",
    bankName: "GTBank",
    isDefault: true,
  },
  {
    id: "2",
    label: "Binance Wallet",
    type: "wallet",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    walletType: "ERC20",
    isDefault: false,
  },
]

// API functions
export async function getUser(): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUser), 300)
  })
}

export async function getWallets(): Promise<Wallet[]> {
  try {
    const res = await fetch(`/api/fstack/wallet/user-balances`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    const payload = await res.json();
    const list: any[] = Array.isArray(payload?.data) ? payload.data : [];

    // If upstream did not return OK, surface zeroed wallets (no mock data)
    if (!res.ok) {
      const supported: Array<Wallet['type']> = ['NGN', 'USDT', 'USDC', 'CNGN']
      return supported.map((type, idx) => ({
        id: String(idx + 1),
        type,
        balance: 0,
        accountNumber: type === 'NGN' ? '' : undefined,
        walletAddress: type !== 'NGN' ? '' : undefined,
      }))
    }

    // Normalize currencies and map to UI Wallet type
    const byCurrency = new Map<string, any>();
    for (const item of list) {
      const raw = typeof item?.currency === 'string' ? item.currency.trim() : '';
      const code = raw.toUpperCase(); // e.g., cNGN -> CNGN
      byCurrency.set(code, item);
    }

    const supported: Array<Wallet['type']> = ['NGN', 'USDT', 'USDC', 'CNGN'];
    const wallets: Wallet[] = supported.map((type, idx) => {
      const entry = byCurrency.get(type);
      const total = Number(entry?.balance?.total) || Number(entry?.balance?.available) || 0;
      const address = entry?.walletAddress || entry?.address || '';
      return {
        id: String(idx + 1),
        type,
        balance: total,
        accountNumber: type === 'NGN' ? (entry?.accountNumber || '') : undefined,
        walletAddress: type !== 'NGN' ? address : undefined,
      };
    });

    return wallets;
  } catch (err) {
    // No mock fallback: return supported wallets with zero balances
    const supported: Array<Wallet['type']> = ['NGN', 'USDT', 'USDC', 'CNGN'];
    return supported.map((type, idx) => ({
      id: String(idx + 1),
      type,
      balance: 0,
      accountNumber: type === 'NGN' ? '' : undefined,
      walletAddress: type !== 'NGN' ? '' : undefined,
    }));
  }
}

export async function getTransactions(filter?: string, limit?: number): Promise<Transaction[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = mockTransactions
      if (filter && filter !== "All") {
        filtered = mockTransactions.filter((t) => t.type === filter)
      }
      if (limit) {
        filtered = filtered.slice(0, limit)
      }
      resolve(filtered)
    }, 300)
  })
}

export async function getRates(): Promise<ExchangeRate[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockRates), 300)
  })
}

export async function getP2POffers(): Promise<P2POffer[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockP2POffers), 300)
  })
}

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockSavedAccounts), 300)
  })
}

export function convertCurrency(amount: number, from: string, to: string): number {
  const rate = mockRates.find((r) => r.from === from && r.to === to)
  return rate ? amount * rate.rate : amount
}
