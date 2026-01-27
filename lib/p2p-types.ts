
export type OrderStatus =
  | 'pending_payment'                 // Initial state - waiting for payment
  | 'awaiting_release'                // Legacy - waiting for crypto release
  | 'awaiting_merchant_confirmation'  // After user marks as paid
  | 'PAYMENT_CONFIRMED_BY_BUYER'      // Alias for awaiting_merchant_confirmation
  | 'paid'                           // Payment confirmed by buyer
  | 'completed'                      // Trade successfully completed
  | 'cancelled'                      // Trade cancelled by user/merchant
  | 'disputed';                      // Trade under dispute
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
  // Cancel tracking
  cancelledBy?: 'buyer' | 'merchant' | 'system';
  cancelReason?: string;
  // Dispute tracking
  disputedAt?: Date;
  disputeReason?: string;
  disputeDetails?: string;
  disputeEvidence?: string; // Base64 image of dispute evidence
  disputeId?: string;
  disputeStatus?: 'pending' | 'resolved_buyer' | 'resolved_merchant' | 'rejected';
  disputeResolvedAt?: Date;
}
