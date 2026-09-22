// import { cookies } from "next/headers";
// import type { Wallet } from "@/lib/mock-api";

// export async function getWallets(): Promise<Wallet[]> {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("access_token")?.value || "";
//     const base = process.env.FINSTACK_BACKEND_API_URL;
//     if (!base) return [];

//     const [balancesRes, walletDetailsRes] = await Promise.all([
//       fetch(`${base}wallet/user-balances`, {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         cache: "no-store",
//       }),
//       fetch(`${base}getWallet`, {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         cache: "no-store",
//       }),
//     ]);

//     let balancesPayload: any = {};
//     try {
//       balancesPayload = await balancesRes.json();
//     } catch {}
//     const balancesList: any[] = Array.isArray(balancesPayload?.data)
//       ? balancesPayload.data
//       : [];

//     let walletDetailsPayload: any = {};
//     try {
//       walletDetailsPayload = await walletDetailsRes.json();
//     } catch {}
//     const walletDetailsList: any[] = Array.isArray(
//       walletDetailsPayload?.wallets,
//     )
//       ? walletDetailsPayload.wallets
//       : [];

//     // Build balance lookup by currency
//     const byCurrency = new Map<string, any>();
//     for (const item of balancesList) {
//       const code =
//         typeof item?.currency === "string"
//           ? item.currency.trim().toUpperCase()
//           : "";
//       if (code) byCurrency.set(code, item);
//     }

//     // Map wallets — deduplicate by currency, NGN first
//     const ORDER = ["NGN", "USDC", "CNGN"];
//     const walletMap = new Map<string, Wallet>();

//     for (const item of walletDetailsList) {
//       if (typeof item?.currency !== "string") continue;
//       const type = item.currency.trim().toUpperCase() as Wallet["type"];
//       const balanceEntry = byCurrency.get(type);

//       // NGN balance comes from DB directly (Nomba doesn't sync via Blockradar)
//       const balance =
//         type === "NGN"
//           ? Number(item.balance) || 0
//           : Number(balanceEntry?.balance?.total) ||
//             Number(balanceEntry?.balance?.available) ||
//             Number(item.balance) ||
//             0;

//       walletMap.set(type, {
//         id: String(item._id || `${type}-${item.externalWalletId}`),
//         type,
//         balance,
//         accountNumber: item.accountNumber || undefined,
//         accountName: item.accountName || undefined,
//         bankName: item.bankName || undefined,
//         externalWalletId: item.externalWalletId || undefined,
//         provider: item.provider || undefined,
//         status: item.status || undefined,
//         usage: item.usage || undefined,
//         walletAddress: item.walletAddress || undefined,
//         walletType: item.walletType || undefined,
//       });
//     }

//     const result: Wallet[] = ORDER.filter((type) => walletMap.has(type)).map(
//       (type) => walletMap.get(type)!,
//     );

//     return result.length > 0 ? result : [];
//   } catch (err) {
//     console.error("[getWallets] Error:", err);
//     return [];
//   }
// }
import { cookies } from "next/headers";
import type { Wallet } from "@/lib/mock-api";

export async function getWallets(): Promise<Wallet[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || "";
    const base = process.env.FINSTACK_BACKEND_API_URL;
    if (!base) return [];

    const [balancesRes, walletDetailsRes] = await Promise.all([
      fetch(`${base}wallet/user-balances`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }),
      fetch(`${base}getWallet`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }),
    ]);

    let balancesPayload: any = {};
    try {
      balancesPayload = await balancesRes.json();
    } catch {}
    const balancesList: any[] = Array.isArray(balancesPayload?.data)
      ? balancesPayload.data
      : [];

    let walletDetailsPayload: any = {};
    try {
      walletDetailsPayload = await walletDetailsRes.json();
    } catch {}
    const walletDetailsList: any[] = Array.isArray(
      walletDetailsPayload?.wallets,
    )
      ? walletDetailsPayload.wallets
      : [];

    // Build balance lookup by currency.
    // If a currency appears twice, the last entry wins. The backend puts
    // the Nomba NGN entry last on purpose.
    const byCurrency = new Map<string, any>();
    for (const item of balancesList) {
      const code =
        typeof item?.currency === "string"
          ? item.currency.trim().toUpperCase()
          : "";
      if (code) byCurrency.set(code, item);
    }

    // Map wallets — deduplicate by currency, NGN first
    const ORDER = ["NGN", "USDC", "CNGN"];
    const walletMap = new Map<string, Wallet>();

    for (const item of walletDetailsList) {
      if (typeof item?.currency !== "string") continue;
      const type = item.currency.trim().toUpperCase() as Wallet["type"];
      const balanceEntry = byCurrency.get(type);

      // UPDATED: every currency (including NGN) now reads its balance from
      // the /wallet/user-balances endpoint. Previously NGN read `item.balance`
      // from /getWallet, but that endpoint never returns `balance`, so the
      // NGN balance was always 0.
      const balance =
        Number(balanceEntry?.balance?.total) ||
        Number(balanceEntry?.balance?.available) ||
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

    const result: Wallet[] = ORDER.filter((type) => walletMap.has(type)).map(
      (type) => walletMap.get(type)!,
    );

    return result.length > 0 ? result : [];
  } catch (err) {
    console.error("[getWallets] Error:", err);
    return [];
  }
}