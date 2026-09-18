import { cookies } from "next/headers";
import type { Wallet } from "@/lib/mock-api";

export async function getWallets(): Promise<Wallet[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || "";
    const base = process.env.FINSTACK_BACKEND_API_URL;

    if (!base) {
      return [];
    }

    // Fetch both endpoints in parallel
    const [balancesRes, walletDetailsRes] = await Promise.all([
      fetch(`${base}wallet/user-balances`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }),
      fetch(`${base}getWallet`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }),
    ]);

    // Parse balances
    let balancesPayload: any = {};
    try {
      balancesPayload = await balancesRes.json();
    } catch {}
    const balancesList: any[] = Array.isArray(balancesPayload?.data)
      ? balancesPayload.data
      : [];

    // Parse wallet details
    let walletDetailsPayload: any = {};
    try {
      walletDetailsPayload = await walletDetailsRes.json();
    } catch {}
    const walletDetailsList: any[] = Array.isArray(walletDetailsPayload)
      ? walletDetailsPayload
      : Array.isArray(walletDetailsPayload?.wallets)
        ? walletDetailsPayload.wallets
      : Array.isArray(walletDetailsPayload?.data?.wallets)
        ? walletDetailsPayload.data.wallets
        : Array.isArray(walletDetailsPayload?.data)
          ? walletDetailsPayload.data
          : [];

    // Build balance lookup by currency
    const byCurrency = new Map<string, any>();
    for (const item of balancesList) {
      const code =
        typeof item?.currency === "string"
          ? item.currency.trim().toUpperCase()
          : "";
      if (code) byCurrency.set(code, item);
    }

    // Map all wallets from DB — NGN first, then USDC, then CNGN
    const ORDER = ["NGN", "USDC", "CNGN"];
    const walletMap = new Map<string, Wallet>();

    for (const item of walletDetailsList) {
      if (typeof item?.currency !== "string") continue;
      const type = item.currency.trim().toUpperCase() as Wallet["type"];
      const balanceEntry = byCurrency.get(type);

      // For NGN use the DB balance directly; for crypto use the balance sync
      const balance =
        type === "NGN"
          ? Number(item.balance) || 0
          : Number(balanceEntry?.balance?.total) ||
            Number(balanceEntry?.balance?.available) ||
            Number(item.balance) ||
            0;

      walletMap.set(type, {
        id: String(item._id || `${type}-${item.externalWalletId}`),
        type,
        balance,
        accountNumber: item.accountNumber || undefined,
        accountName: item.accountName || undefined,
        bankName: item.bankName || undefined,
        externalWalletId: item.externalWalletId || undefined,
        provider: item.provider || undefined,
        status: item.status || undefined,
        usage: item.usage || undefined,
        walletAddress: item.walletAddress || undefined,
        walletType: item.walletType || undefined,
      });
    }

    // Return in correct order
    const result: Wallet[] = ORDER.filter((type) => walletMap.has(type)).map(
      (type) => walletMap.get(type)!,
    );

    return result.length > 0 ? result : [];
  } catch (err) {
    console.error("[getWallets] Error:", err);
    return [];
  }
}
