import { cookies } from "next/headers"
import type { Wallet } from "@/lib/mock-api"

// Extended wallet info that includes bank details for NGN
interface WalletWithBankDetails extends Wallet {
  bankName?: string
  accountName?: string
}

export async function getWallets(): Promise<WalletWithBankDetails[]> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value || ''
    const base = process.env.FINSTACK_BACKEND_API_URL

    if (!base) {
      const supported: Array<Wallet['type']> = ['NGN', 'USDT', 'USDC', 'CNGN']
      return supported.map((type, idx) => ({
        id: String(idx + 1),
        type,
        balance: 0,
        accountNumber: type === 'NGN' ? '' : undefined,
        walletAddress: type !== 'NGN' ? '' : undefined,
      }))
    }

    // Fetch both endpoints in parallel
    const [balancesRes, walletDetailsRes] = await Promise.all([
      // Fetch balances from user-balances endpoint
      fetch(`${base}wallet/user-balances`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      }),
      // Fetch NGN account details from getWallet endpoint
      fetch(`${base}getWallet`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      })
    ])

    // Parse balances
    let balancesPayload: any = {}
    try {
      balancesPayload = await balancesRes.json()
    } catch { }
    const balancesList: any[] = Array.isArray(balancesPayload?.data) ? balancesPayload.data : []

    // Parse wallet details (for NGN account info)
    let walletDetailsPayload: any = {}
    try {
      walletDetailsPayload = await walletDetailsRes.json()
    } catch { }
    const walletDetailsList: any[] = Array.isArray(walletDetailsPayload?.wallets)
      ? walletDetailsPayload.wallets
      : (Array.isArray(walletDetailsPayload?.data) ? walletDetailsPayload.data : [])

    // Find NGN wallet details from getWallet response
    const ngnWalletDetails = walletDetailsList.find((w: any) =>
      w?.currency === 'NGN' || w?.type === 'NGN'
    )

    // Normalize currencies and map to UI Wallet type
    const byCurrency = new Map<string, any>()
    for (const item of balancesList) {
      const raw = typeof item?.currency === 'string' ? item.currency.trim() : ''
      const code = raw.toUpperCase() // e.g., cNGN -> CNGN
      byCurrency.set(code, item)
    }

    const supported: Array<Wallet['type']> = ['NGN', 'USDT', 'USDC', 'CNGN']
    const wallets: WalletWithBankDetails[] = supported.map((type, idx) => {
      const entry = byCurrency.get(type)
      const total = Number(entry?.balance?.total) || Number(entry?.balance?.available) || 0
      const address = entry?.walletAddress || entry?.address || ''

      // For NGN, merge bank details from getWallet response
      if (type === 'NGN') {
        return {
          id: String(idx + 1),
          type,
          balance: total,
          accountNumber: ngnWalletDetails?.accountNumber || entry?.accountNumber || '',
          bankName: ngnWalletDetails?.bankName || '',
          accountName: ngnWalletDetails?.accountName || '',
        }
      }

      return {
        id: String(idx + 1),
        type,
        balance: total,
        walletAddress: address,
      }
    })

    return wallets
  } catch (err) {
    console.error('[getWallets] Error:', err)
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