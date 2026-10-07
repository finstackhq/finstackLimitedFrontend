// lib/p2p-price.ts
//
// THE RULE (same as the backend, for every coin):
//   ad.price = how much of the fiat currency buys 1 unit of the coin
//   coin amount = fiat amount / price
//
// NGN and CNGN are both naira, so people think and type the other way
// ("₦2.55 for 1 XAF"). For those two coins this file converts:
//   backend price 0.392157  <->  "₦2.550/XAF"

export const NAIRA_ASSETS = ["NGN", "CNGN"];

export const isNairaAsset = (asset: string) => NAIRA_ASSETS.includes(asset);

function fiatSymbol(fiat: string) {
  if (fiat === "NGN") return "₦";
  if (fiat === "RMB" || fiat === "CNY") return "¥";
  if (fiat === "GHS") return "₵";
  if (fiat === "USD") return "$";
  return `${fiat} `; // e.g. "XAF 650.000"
}

function fmt(value: number) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

// What the user sees on an ad.
//   CNGN / NGN ads:  "₦2.550/XAF"   (naira you get for 1 unit of the fiat)
//   USDC / USDT ads: "₦1,650.000/USD"  (fiat you pay for 1 dollar coin)
export function formatAdPrice(price: number, asset: string, fiat: string) {
  if (!price || price <= 0) return "—";

  if (isNairaAsset(asset)) {
    return `₦${fmt(1 / price)}/${fiat}`;
  }

  if (asset === "USDC" || asset === "USDT") {
    return `${fiatSymbol(fiat)}${fmt(price)}/USD`;
  }

  return `${fiatSymbol(fiat)}${fmt(price)}/${asset}`;
}

// Merchant types "₦ per 1 fiat" (e.g. 2.55) -> number to send to the backend (0.392157)
export function toBackendPrice(entered: number, asset: string) {
  if (!entered || entered <= 0) return 0;
  return isNairaAsset(asset) ? Number((1 / entered).toFixed(8)) : entered;
}

// Backend price (0.392157) -> number to show the merchant ("₦ per 1 fiat" = 2.55)
export function fromBackendPrice(stored: number, asset: string) {
  if (!stored || stored <= 0) return 0;
  return isNairaAsset(asset) ? Number((1 / stored).toFixed(4)) : stored;
}