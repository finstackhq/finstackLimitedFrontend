import { cookies } from "next/headers"
import type { Wallet } from "@/lib/mock-api"

export async function getWallets(): Promise<Wallet[]> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value || ''
    const base = process.env.FINSTACK_BACKEND_API_URL
    const endpoint = base ? `${base}wallet/user-balances` : ''
    if (!endpoint) {
      const supported: Array<Wallet['type']> = ['NGN', 'USDT', 'USDC', 'CNGN']
      return supported.map((type, idx) => ({
        id: String(idx + 1),
        type,
        balance: 0,
        accountNumber: type === 'NGN' ? '' : undefined,
        walletAddress: type !== 'NGN' ? '' : undefined,
      }))
    }

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })

    const payload = await res.json()
    const list: any[] = Array.isArray(payload?.data) ? payload.data : []

    // Normalize currencies and map to UI Wallet type
    const byCurrency = new Map<string, any>()
    for (const item of list) {
      const raw = typeof item?.currency === 'string' ? item.currency.trim() : ''
      const code = raw.toUpperCase() // e.g., cNGN -> CNGN
      byCurrency.set(code, item)
    }

    const supported: Array<Wallet['type']> = ['NGN', 'USDT', 'USDC', 'CNGN']
    const wallets: Wallet[] = supported.map((type, idx) => {
      const entry = byCurrency.get(type)
      const total = Number(entry?.balance?.total) || Number(entry?.balance?.available) || 0
      const address = entry?.walletAddress || entry?.address || ''
      return {
        id: String(idx + 1),
        type,
        balance: total,
        accountNumber: type === 'NGN' ? (entry?.accountNumber || '') : undefined,
        walletAddress: type !== 'NGN' ? address : undefined,
      }
    })

    return wallets
  } catch (err) {
    // No mock fallback: return supported wallets with zero balances
    const supported: Array<Wallet['type']> = ['NGN', 'USDT', 'USDC', 'CNGN']
    return supported.map((type, idx) => ({
      id: String(idx + 1),
      type,
      balance: 0,
      accountNumber: type === 'NGN' ? '' : undefined,
      walletAddress: type !== 'NGN' ? '' : undefined,
    }))
  }
}