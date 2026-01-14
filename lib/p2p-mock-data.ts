// Mock data for P2P Merchant Marketplace system

export type OrderStatus = 'pending_payment' | 'awaiting_release' | 'PAYMENT_CONFIRMED_BY_BUYER' | 'completed' | 'cancelled' | 'disputed';
export type PaymentMethod = 'Bank Transfer' | 'MTN Mobile Money' | 'Alipay' | 'Custom Account' | 'CNGN Wallet';
export type AdType = 'buy' | 'sell';
export type RatingType = 'positive' | 'neutral' | 'negative';
export type CountryCode = 'NG' | 'CN' | 'GH' | 'GLOBAL';

export interface PaymentMethodDetails {
  type: PaymentMethod;
  label?: string; // For custom accounts
  details?: string; // Account number, MTN number, etc.
  qrCodeImage?: string; // For Alipay QR code
  accountName?: string; // For bank transfers and Alipay
  bankName?: string; // For bank transfers
}

export interface Merchant {
  id: string;
  name: string;
  businessName?: string;
  avatar?: string;
  rating: number; // 0-100
  totalTrades: number;
  completionRate: number; // 0-100
  responseTime: string;
  verifiedBadge: boolean; // All merchants are verified in this marketplace
  activeAds: number;
  country: CountryCode;
  joinedDate: string;
  languages: string[];
}

// Alias for backwards compatibility
export type Trader = Merchant;

export interface P2PAd {
  id: string;
  merchantId: string; // Changed from traderId to emphasize merchant marketplace
  type: AdType;
  cryptoCurrency: string;
  fiatCurrency: string;
  price: number;
  available: number;
  minLimit: number;
  maxLimit: number;
  paymentMethods: PaymentMethod[];
  paymentMethodDetails?: PaymentMethodDetails[]; // Detailed payment info
  paymentWindow: number; // minutes
  instructions?: string;
  autoReply?: string;
  country: CountryCode;
  isActive?: boolean; // Ad status control - defaults to true if not specified
}

export interface P2POrder {
  id: string;
  adId: string;
  buyerId: string;
  merchantId: string; // The merchant in the transaction
  cryptoCurrency: string;
  fiatCurrency: string;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentMethodDetails?: PaymentMethodDetails; // The specific payment details for this order
  paymentWindow: number;
  createdAt: Date;
  expiresAt: Date;
  paidAt?: Date;
  releasedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  rating?: RatingType;
  ratingComment?: string;
  userAccountDetails?: string; // User's wallet address or payment details (when user is selling)
  escrowAddress?: string; // Escrow wallet address (for crypto held during transaction)
  paymentProof?: string; // Base64 image of payment proof
}

// Mock merchants (verified vendors only)
export const mockMerchants: Record<string, Merchant> = {
  'merchant1': {
    id: 'merchant1',
    name: 'CryptoKing',
    businessName: 'CryptoKing Exchange',
    rating: 98,
    totalTrades: 1247,
    completionRate: 99,
    responseTime: '2 mins',
    verifiedBadge: true,
    activeAds: 8,
    country: 'NG',
    joinedDate: '2023-01-15',
    languages: ['English', 'Yoruba']
  },
  'merchant2': {
    id: 'merchant2',
    name: 'FiatMaster',
    businessName: 'FiatMaster Trading Co.',
    rating: 95,
    totalTrades: 856,
    completionRate: 97,
    responseTime: '5 mins',
    verifiedBadge: true,
    activeAds: 5,
    country: 'CN',
    joinedDate: '2023-03-20',
    languages: ['English', 'Mandarin']
  },
  'merchant3': {
    id: 'merchant3',
    name: 'SwapWizard',
    businessName: 'SwapWizard Exchange',
    rating: 92,
    totalTrades: 543,
    completionRate: 95,
    responseTime: '3 mins',
    verifiedBadge: true,
    activeAds: 3,
    country: 'GH',
    joinedDate: '2023-06-10',
    languages: ['English', 'Twi']
  },
  'merchant4': {
    id: 'merchant4',
    name: 'QuickTrade',
    businessName: 'QuickTrade Services',
    rating: 96,
    totalTrades: 324,
    completionRate: 98,
    responseTime: '4 mins',
    verifiedBadge: true,
    activeAds: 2,
    country: 'NG',
    joinedDate: '2023-08-05',
    languages: ['English', 'Igbo']
  },
  'merchant5': {
    id: 'merchant5',
    name: 'P2PExpert',
    businessName: 'P2PExpert Global',
    rating: 97,
    totalTrades: 2103,
    completionRate: 98,
    responseTime: '1 min',
    verifiedBadge: true,
    activeAds: 12,
    country: 'GLOBAL',
    joinedDate: '2022-11-01',
    languages: ['English', 'French', 'Portuguese']
  },
  'TestingMerchant': {
    id: 'TestingMerchant',
    name: 'TestingMerchant',
    businessName: 'TestingMerchant Trading',
    rating: 100,
    totalTrades: 0,
    completionRate: 100,
    responseTime: '1 min',
    verifiedBadge: true,
    activeAds: 0,
    country: 'GLOBAL',
    joinedDate: new Date().toISOString().split('T')[0],
    languages: ['English']
  }
};

// Backwards compatibility
export const mockTraders = mockMerchants;

// Mock P2P ads for merchant marketplace
export const mockP2PAds: P2PAd[] = [
  {
    id: 'ad1',
    merchantId: 'merchant1',
    type: 'sell',
    cryptoCurrency: 'USDT',
    fiatCurrency: 'NGN',
    price: 1650,
    available: 5000,
    minLimit: 10000,
    maxLimit: 500000,
    paymentMethods: ['Bank Transfer'],
    paymentWindow: 15,
    instructions: 'Please include order ID in payment reference.',
    country: 'NG'
  },
  {
    id: 'ad2',
    merchantId: 'merchant2',
    type: 'sell',
    cryptoCurrency: 'USDT',
    fiatCurrency: 'RMB',
    price: 7.25,
    available: 10000,
    minLimit: 500,
    maxLimit: 50000,
    paymentMethods: ['Alipay'],
    paymentWindow: 30,
    instructions: 'Scan QR code and transfer the exact amount.',
    country: 'CN'
  },
  {
    id: 'ad3',
    merchantId: 'merchant3',
    type: 'sell',
    cryptoCurrency: 'USDC',
    fiatCurrency: 'GHS',
    price: 15.8,
    available: 2000,
    minLimit: 200,
    maxLimit: 5000,
    paymentMethods: ['MTN Mobile Money'],
    paymentWindow: 20,
    instructions: 'Send to MTN MoMo number provided. Include reference.',
    country: 'GH'
  },
  {
    id: 'ad4',
    merchantId: 'merchant1',
    type: 'buy',
    cryptoCurrency: 'USDT',
    fiatCurrency: 'NGN',
    price: 1640,
    available: 8000,
    minLimit: 20000,
    maxLimit: 1000000,
    paymentMethods: ['Bank Transfer'],
    paymentWindow: 15,
    country: 'NG'
  },
  {
    id: 'ad5',
    merchantId: 'merchant4',
    type: 'sell',
    cryptoCurrency: 'USDC',
    fiatCurrency: 'NGN',
    price: 1655,
    available: 3000,
    minLimit: 5000,
    maxLimit: 300000,
    paymentMethods: ['Bank Transfer'],
    paymentWindow: 20,
    country: 'NG'
  },
  {
    id: 'ad6',
    merchantId: 'merchant2',
    type: 'buy',
    cryptoCurrency: 'USDC',
    fiatCurrency: 'RMB',
    price: 7.15,
    available: 5000,
    minLimit: 1000,
    maxLimit: 30000,
    paymentMethods: ['Alipay'],
    paymentWindow: 25,
    instructions: 'Buying USDC with RMB. Will pay via Alipay immediately.',
    country: 'CN'
  },
  {
    id: 'ad7',
    merchantId: 'merchant3',
    type: 'buy',
    cryptoCurrency: 'USDT',
    fiatCurrency: 'GHS',
    price: 15.5,
    available: 4000,
    minLimit: 300,
    maxLimit: 3000,
    paymentMethods: ['MTN Mobile Money'],
    paymentWindow: 20,
    instructions: 'Buying USDT. MTN MoMo payment within 5 mins.',
    country: 'GH'
  },
  {
    id: 'ad8',
    merchantId: 'merchant5',
    type: 'sell',
    cryptoCurrency: 'CNGN',
    fiatCurrency: 'NGN',
    price: 1.02,
    available: 50000,
    minLimit: 5000,
    maxLimit: 200000,
    paymentMethods: ['Bank Transfer'],
    paymentWindow: 15,
    country: 'NG'
  },
  {
    id: 'ad9',
    merchantId: 'merchant5',
    type: 'buy',
    cryptoCurrency: 'USDT',
    fiatCurrency: 'NGN',
    price: 1645,
    available: 10000,
    minLimit: 15000,
    maxLimit: 800000,
    paymentMethods: ['Bank Transfer'],
    paymentWindow: 15,
    instructions: 'Fast payment guaranteed. Large orders welcome.',
    country: 'NG'
  },
  {
    id: 'ad10',
    merchantId: 'merchant4',
    type: 'sell',
    cryptoCurrency: 'USDT',
    fiatCurrency: 'NGN',
    price: 1648,
    available: 6000,
    minLimit: 10000,
    maxLimit: 400000,
    paymentMethods: ['Bank Transfer'],
    paymentWindow: 20,
    country: 'NG'
  }
];

// Helper to get merchant by ID
export const getMerchant = (id: string): Merchant | undefined => mockMerchants[id];
export const getTrader = getMerchant; // Backwards compatibility

// Helper to get ads by merchant
export const getAdsByMerchant = (merchantId: string): P2PAd[] =>
  mockP2PAds.filter(ad => ad.merchantId === merchantId);
export const getAdsByTrader = getAdsByMerchant; // Backwards compatibility
