// Royal blue color for primary actions
export const ROYAL_BLUE = "#2F67FA"
export const ROYAL_BLUE_LIGHT = "#4a7bff"
export const GRAY_PRIMARY = "#6B7280"
export const GRAY_SECONDARY = "#9CA3AF"

// Wallet types and currencies (held in Finstack wallets)
export const WALLET_TYPES = ["NGN", "USDT", "USDC", "CNGN"] as const
export type WalletType = typeof WALLET_TYPES[number]

export const CURRENCY_SYMBOLS: Record<WalletType, string> = {
	NGN: "₦",
	USDT: "$",
	USDC: "$",
	CNGN: "₦"
}

export const CURRENCY_NAMES: Record<WalletType, string> = {
	NGN: "Nigerian Naira",
	USDT: "Tether",
	USDC: "USD Coin",
	CNGN: "Crypto Naira"
}

// P2P Marketplace specific currencies (includes merchant-only currencies)
export const P2P_FIAT_CURRENCIES = ["NGN", "RMB", "GHS"] as const
export const P2P_CRYPTO_CURRENCIES = ["USDT", "USDC", "CNGN"] as const

export type P2PFiatCurrency = typeof P2P_FIAT_CURRENCIES[number]
export type P2PCryptoCurrency = typeof P2P_CRYPTO_CURRENCIES[number]
export type P2PCurrency = P2PFiatCurrency | P2PCryptoCurrency

export const P2P_CURRENCY_SYMBOLS: Record<P2PCurrency, string> = {
	NGN: "₦",
	RMB: "¥",
	GHS: "₵",
	USDT: "$",
	USDC: "$",
	CNGN: "₦"
}

export const P2P_CURRENCY_NAMES: Record<P2PCurrency, string> = {
	NGN: "Nigerian Naira",
	RMB: "Chinese Yuan",
	GHS: "Ghanaian Cedi",
	USDT: "Tether",
	USDC: "USD Coin",
	CNGN: "Crypto Naira"
}

export const P2P_CURRENCY_COUNTRIES: Record<P2PCurrency, string> = {
	NGN: "Nigeria",
	RMB: "China",
	GHS: "Ghana",
	USDT: "Global",
	USDC: "Global",
	CNGN: "Nigeria"
}
