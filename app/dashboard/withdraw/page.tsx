"use client";

// Static mapping of supported banks and their institution codes.
// IMPORTANT: this is the PAYCREST bank list, used only by the existing
// CNGN -> Paycrest flow below. The new Nomba NGN flow never uses this list
// — it fetches its own bank codes from /api/fstack/withdraw/nomba-banks,
// because Nomba's bank codes ("058") are a different format from these
// ("GTBINGLA") and are not interchangeable.
const SUPPORTED_BANKS = [
  { name: "Access Bank", code: "ABNGNGLA" },

  { name: "Diamond Bank", code: "DBLNNGLA" },

  { name: "Fidelity Bank", code: "FIDTNGLA" },

  { name: "FCMB", code: "FCMBNGLA" },

  { name: "First Bank Of Nigeria", code: "FBNINGLA" },

  { name: "Guaranty Trust Bank", code: "GTBINGLA" },

  { name: "Polaris Bank", code: "PRDTNGLA" },

  { name: "Union Bank", code: "UBNINGLA" },

  { name: "United Bank for Africa", code: "UNAFNGLA" },

  { name: "Citibank", code: "CITINGLA" },

  { name: "Ecobank Bank", code: "ECOCNGLA" },

  { name: "Heritage", code: "HBCLNGLA" },

  { name: "Keystone Bank", code: "PLNINGLA" },

  { name: "Stanbic IBTC Bank", code: "SBICNGLA" },

  { name: "Standard Chartered Bank", code: "SCBLNGLA" },

  { name: "Sterling Bank", code: "NAMENGLA" },

  { name: "Unity Bank", code: "ICITNGLA" },

  { name: "Suntrust Bank", code: "SUTGNGLA" },

  { name: "Providus Bank", code: "PROVNGLA" },

  { name: "FBNQuest Merchant Bank", code: "KDHLNGLA" },

  { name: "Greenwich Merchant Bank", code: "GMBLNGLA" },

  { name: "FSDH Merchant Bank", code: "FSDHNGLA" },

  { name: "Rand Merchant Bank", code: "FIRNNGLA" },

  { name: "Jaiz Bank", code: "JAIZNGLA" },

  { name: "Zenith Bank", code: "ZEIBNGLA" },

  { name: "Wema Bank", code: "WEMANGLA" },

  { name: "Kuda Microfinance Bank", code: "KUDANGPC" },

  { name: "OPay", code: "OPAYNGPC" },

  { name: "PalmPay", code: "PALMNGPC" },

  { name: "Paystack-Titan MFB", code: "PAYTNGPC" },

  { name: "Moniepoint MFB", code: "MONINGPC" },

  { name: "Safe Haven MFB", code: "SAHVNGPC" },

  { name: "BellBank MFB", code: "BELLNGPC" },
];

import { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Stepper } from "@/components/dashboard/stepper";

import { OTPInput } from "@/components/dashboard/otp-input";

import { AddAccountDialog } from "@/components/dashboard/add-account-dialog";

import { AddWalletDialog } from "@/components/dashboard/add-wallet-dialog";

import { ArrowLeft, Sparkles, Plus, Loader2 } from "lucide-react";

import { convertCurrency } from "@/lib/mock-api";

import { useToast } from "@/hooks/use-toast";

const steps = [
  { number: 1, title: "Select Wallet" },

  { number: 2, title: "Destination" },

  { number: 3, title: "Enter Amount" },

  { number: 4, title: "Verify OTP" },

  { number: 5, title: "Complete" },
];

interface BankAccount {
  id: string;

  accountNumber: string;

  accountName: string;

  bankName: string;

  bankCode: string;
}

interface WithdrawalWallet {
  id: string;
  name: string;
  address: string;
  network: string;
  asset: string;
}

// Nomba's own bank list shape, from GET /api/fstack/withdraw/nomba-banks
interface NombaBank {
  name: string;
  code: string;
}

export default function WithdrawPage() {
  const { toast } = useToast();

  // State for withdrawal wallets
  const [withdrawalWallets, setWithdrawalWallets] = useState<
    WithdrawalWallet[]
  >([]);
  const [loadingWallets, setLoadingWallets] = useState(false);

  // Fetch withdrawal wallets from backend
  useEffect(() => {
    const fetchWithdrawalWallets = async () => {
      setLoadingWallets(true);
      try {
        const res = await fetch("/api/fstack/withdrawal-wallets");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setWithdrawalWallets(data.data);
        } else {
          setWithdrawalWallets([]);
        }
      } catch (err) {
        setWithdrawalWallets([]);
        console.error("Failed to fetch withdrawal wallets:", err);
      } finally {
        setLoadingWallets(false);
      }
    };
    fetchWithdrawalWallets();
  }, []);

  const [currentStep, setCurrentStep] = useState(1);

  // UPDATED: added "NGN_NOMBA" as a third, separate option. "NGN" here still
  // means the existing CNGN -> Paycrest flow — unchanged, kept for backward
  // compatibility with however it's referenced elsewhere in the app.
  const [selectedWallet, setSelectedWallet] = useState<
    "NGN" | "USDT" | "NGN_NOMBA" | null
  >(null);

  const [amount, setAmount] = useState("");

  const [selectedDestination, setSelectedDestination] = useState<
    number | string | null
  >(null);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);

  const [withdrawalData, setWithdrawalData] = useState<any>(null);

  // Bank accounts state (used by the existing CNGN -> Paycrest flow only)

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // NEW: state for the Nomba NGN flow. Kept completely separate from
  // bankAccounts above — Nomba needs its own bank codes and this flow does
  // not save destinations for reuse (matching the docs' resolve-per-transfer
  // model).
  const [nombaBanks, setNombaBanks] = useState<NombaBank[]>([]);
  const [loadingNombaBanks, setLoadingNombaBanks] = useState(true);
  const [nombaBankCode, setNombaBankCode] = useState("");
  const [nombaAccountNumber, setNombaAccountNumber] = useState("");
  const [nombaAccountName, setNombaAccountName] = useState("");

  useEffect(() => {
    const fetchNombaBanks = async () => {
      setLoadingNombaBanks(true);
      try {
        const res = await fetch("/api/fstack/withdraw/nomba-banks");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.banks)) {
          setNombaBanks(data.banks);
        } else {
          setNombaBanks([]);
        }
      } catch (err) {
        setNombaBanks([]);
        console.error("Failed to fetch Nomba bank list:", err);
      } finally {
        setLoadingNombaBanks(false);
      }
    };
    fetchNombaBanks();
  }, []);

  // Wallet balances state
  // UPDATED: NGN_NOMBA is now tracked separately from NGN (CNGN). Before,
  // the CNGN balance was shown under the single "NGN" key, which would have
  // been wrong for the new Nomba option — that must show the REAL Nomba
  // ledger balance, not the CNGN balance.
  const [walletBalances, setWalletBalances] = useState<{
    NGN: number;

    USDT: number;

    NGN_NOMBA: number;
  }>({ NGN: 0, USDT: 0, NGN_NOMBA: 0 });

  const [loadingBalances, setLoadingBalances] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      setLoadingBalances(true);

      try {
        const res = await fetch("/api/fstack/wallet/user-balances");

        const data = await res.json();

        if (res.ok && Array.isArray(data.data)) {
          // Find CNGN, NGN, USDC, USDT balances

          const cngn = data.data.find((w: any) => w.currency === "CNGN");

          const ngn = data.data.find((w: any) => w.currency === "NGN");

          const usdc = data.data.find((w: any) => w.currency === "USDC");

          const usdt = data.data.find((w: any) => w.currency === "USDT");

          setWalletBalances({
            // NGN (this card) stays exactly as before: CNGN first, falling
            // back to the NGN entry only if CNGN is missing.
            NGN: cngn?.balance?.available ?? ngn?.balance?.available ?? 0,

            USDT: usdc?.balance?.available ?? usdt?.balance?.available ?? 0,

            // NEW: the real Nomba NGN ledger balance, always from the NGN
            // entry specifically — never falls back to CNGN.
            NGN_NOMBA: ngn?.balance?.available ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch wallet balances:", err);
      } finally {
        setLoadingBalances(false);
      }
    };

    fetchBalances();
  }, []);

  // Fetch bank accounts on mount

  useEffect(() => {
    const fetchBankAccounts = async () => {
      setLoadingAccounts(true);

      try {
        const res = await fetch("/api/fstack/profile?type=bank-accounts");

        const data = await res.json();

        // Handle different response formats from backend

        let accounts: BankAccount[] = [];

        if (res.ok) {
          const normalize = (str: string) =>
            (str || "").toLowerCase().replace(/\s+/g, "").trim();

          const mapAccount = (acc: any) => {
            let code = acc.bankCode || acc.institutionCode || "000";

            if (!code || code === "000") {
              const accNameNorm = normalize(acc.bankName);

              const bankInfo = SUPPORTED_BANKS.find((b) =>
                accNameNorm.includes(normalize(b.name)),
              );

              code = bankInfo ? bankInfo.code : "";
            }

            return {
              id: acc._id || acc.id || `acc-${Date.now()}-${Math.random()}`,

              accountNumber: acc.accountNumber,

              accountName: acc.accountName,

              bankName: acc.bankName,

              bankCode: code,
            };
          };

          if (data.success && Array.isArray(data.data)) {
            accounts = data.data.map(mapAccount);
          } else if (Array.isArray(data)) {
            accounts = data.map(mapAccount);
          } else if (data?.bankAccounts && Array.isArray(data.bankAccounts)) {
            accounts = data.bankAccounts.map(mapAccount);
          }

          setBankAccounts(accounts);
        }
      } catch (err) {
        console.error("Failed to fetch bank accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchBankAccounts();
  }, []);

  const handleAccountAdded = async (account: {
    bankName: string;

    accountNumber: string;

    accountName: string;

    bankCode: string;
  }) => {
    try {
      // Save to backend

      const res = await fetch("/api/fstack/profile", {
        method: "PUT",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          bankName: account.bankName,

          accountNumber: account.accountNumber,

          accountName: account.accountName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Failed to add bank account",
        );
      }

      // Add the new account to the local bank accounts list

      // Find the institution code for the selected bank name

      const normalize = (str: string) =>
        (str || "").toLowerCase().replace(/\s+/g, "").trim();

      const accNameNorm = normalize(account.bankName);

      const bankInfo = SUPPORTED_BANKS.find((b) =>
        accNameNorm.includes(normalize(b.name)),
      );

      const newAccount: BankAccount = {
        id: data.data?._id || `temp-${Date.now()}`,

        accountNumber: account.accountNumber,

        accountName: account.accountName,

        bankName: account.bankName,

        bankCode: bankInfo ? bankInfo.code : account.bankCode || "000",
      };

      setBankAccounts((prev) => [...prev, newAccount]);

      toast({
        title: "Bank Account Added",

        description: "Your bank account has been saved and is ready to use",
      });
    } catch (error: any) {
      console.error("Failed to add bank account:", error);

      toast({
        title: "Error",

        description: error.message || "Failed to add bank account",

        variant: "destructive",
      });
    }
  };

  // Refresh withdrawal wallets after add
  const handleWalletAdded = async () => {
    setLoadingWallets(true);
    try {
      const res = await fetch("/api/fstack/withdrawal-wallets");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setWithdrawalWallets(data.data);
      }
    } catch (err) {
      // Optionally show error toast
      console.error("Failed to refresh withdrawal wallets:", err);
    } finally {
      setLoadingWallets(false);
    }
  };

  // UPDATED: branches to the Nomba OTP endpoint for the new option. The
  // CNGN and USDT branches are byte-for-byte unchanged.
  const handleInitiateWithdrawal = async () => {
    if (!selectedWallet || !amount) return;

    setLoading(true);

    try {
      const isNombaFlow = selectedWallet === "NGN_NOMBA";

      const endpoint = isNombaFlow
        ? "/api/fstack/withdraw/nomba-initiate"
        : "/api/fstack/withdraw/initiate";

      const body = isNombaFlow
        ? { amount: parseFloat(amount) }
        : {
            walletCurrency: selectedWallet === "NGN" ? "CNGN" : "USDC",
            amount: parseFloat(amount),
          };

      const res = await fetch(endpoint, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Failed to initiate withdrawal",
        );
      }

      // Store withdrawal data for later use

      setWithdrawalData(data);

      toast({
        title: "OTP Sent",

        description: "A 6-digit code has been sent to your email",
      });

      setCurrentStep(4);
    } catch (error: any) {
      console.error("Initiate withdrawal error:", error);

      toast({
        title: "Error",

        description: error.message || "Failed to initiate withdrawal",

        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: branches to the Nomba completion endpoint. The CNGN and USDT
  // branches are byte-for-byte unchanged.
  const handleCompleteWithdrawal = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",

        description: "Please enter all 6 digits",

        variant: "destructive",
      });

      return;
    }

    if (!selectedWallet) return;

    // The Nomba flow doesn't use selectedDestination (it has its own
    // bank/account-number/account-name fields), so only require it for the
    // other two flows.
    if (selectedWallet !== "NGN_NOMBA" && !selectedDestination) return;

    setLoading(true);

    let endpoint = "";

    let body: any = {};

    try {
      if (selectedWallet === "NGN_NOMBA") {
        endpoint = "/api/fstack/withdraw/nomba-complete";
        body = {
          amount: parseFloat(amount),
          otpCode,
          destinationAccountNumber: nombaAccountNumber,
          institutionCode: nombaBankCode,
          accountName: nombaAccountName,
        };
      } else {
        const destination =
          selectedWallet === "NGN"
            ? bankAccounts.find((a) => a.id === selectedDestination)
            : withdrawalWallets.find((w) => w.id === selectedDestination);

        if (!destination) throw new Error("Destination not found");

        if (selectedWallet === "NGN") {
          // Fiat withdrawal (CNGN -> Paycrest) — unchanged
          endpoint = "/api/fstack/withdraw/fiat-complete";
          const account = destination as BankAccount;
          body = {
            walletCurrency: "CNGN",
            fiatCurrency: "NGN",
            amount: parseFloat(amount),
            otpCode,
            destinationAccountNumber: account.accountNumber,
            institutionCode: account.bankCode,
            accountName: account.accountName,
          };
        } else {
          // Crypto withdrawal — unchanged
          endpoint = "/api/fstack/withdraw/crypto-complete";
          const wallet = destination as WithdrawalWallet;
          body = {
            walletCurrency: wallet.asset || "USDC",
            amount: parseFloat(amount),
            otpCode,
            externalCryptoAddress: wallet.address,
          };
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Failed to complete withdrawal",
        );
      }

      toast({
        title: "Withdrawal Successful",

        description:
          selectedWallet === "NGN_NOMBA"
            ? "You'll be notified by email once it settles."
            : "Your withdrawal has been processed successfully",
      });

      setCurrentStep(5);
    } catch (error: any) {
      console.error("Complete withdrawal error:", error);

      toast({
        title: "Error",

        description: error.message || "Failed to complete withdrawal",

        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];

    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value;

    setOtp(newOtp);

    // Auto-focus next input

    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`,
      ) as HTMLInputElement;

      nextInput?.focus();
    }
  };

  // UPDATED: NGN_NOMBA is naira too, same fee/symbol treatment as NGN.
  const isNairaFlow = selectedWallet === "NGN" || selectedWallet === "NGN_NOMBA";
  const fee = isNairaFlow ? 50 : 1;

  const totalAmount = amount ? Number.parseFloat(amount) + fee : 0;

  // Can the user move past Step 2 for the Nomba flow? Needs a bank, an
  // account number of a sensible length, and a typed account name.
  // NOTE: there is currently no account-lookup endpoint on the backend for
  // Nomba (unlike some payment apps that verify the name before you send).
  // This matches how the existing CNGN flow's "Add Bank Account" dialog
  // already works — the user types the name themselves. Worth adding a
  // real lookup later given this moves real money; ask if you'd like that
  // built (it needs one new backend endpoint + provider function first).
  const canContinueNombaDestination =
    !!nombaBankCode && nombaAccountNumber.length >= 10 && nombaAccountName.trim().length > 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Withdraw Funds
          </h1>

          <p className="text-gray-600">Transfer money from your wallet</p>
        </div>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <Card className="max-w-2xl mx-auto p-6 shadow-lg border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Step 1: Select Wallet */}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Select Wallet
              </h2>

              <p className="text-gray-600">
                Choose which wallet you want to withdraw from
              </p>
            </div>

            {/* UPDATED: grid now fits 3 cards on larger screens instead of 2 */}
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setSelectedWallet("NGN");

                  setCurrentStep(2);
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-[#2F67FA] hover:bg-[#2F67FA]/5 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#2F67FA]/10 flex items-center justify-center group-hover:bg-[#2F67FA] transition-colors">
                    <span className="text-xl font-bold text-[#2F67FA] group-hover:text-white">
                      ₦
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  NGN Wallet
                </h3>

                <p className="text-sm text-gray-600 mb-2">
                  Withdraw Nigerian Naira
                </p>

                <p className="text-lg font-semibold text-foreground">
                  {loadingBalances ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    `₦${walletBalances.NGN.toLocaleString()}`
                  )}
                </p>
              </button>

              {/* NEW: real Nomba NGN withdrawal (bank transfer via Nomba) */}
              <button
                onClick={() => {
                  setSelectedWallet("NGN_NOMBA");

                  setCurrentStep(2);
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-[#2F67FA] hover:bg-[#2F67FA]/5 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <span className="text-xl font-bold text-green-600 group-hover:text-white">
                      ₦
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Naira (Bank Transfer)
                </h3>

                <p className="text-sm text-gray-600 mb-2">
                  Withdraw straight to your bank account
                </p>

                <p className="text-lg font-semibold text-foreground">
                  {loadingBalances ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    `₦${walletBalances.NGN_NOMBA.toLocaleString()}`
                  )}
                </p>
              </button>

              <button
                onClick={() => {
                  setSelectedWallet("USDT");

                  setCurrentStep(2);
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-[#2F67FA] hover:bg-[#2F67FA]/5 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#2F67FA]/10 flex items-center justify-center group-hover:bg-[#2F67FA] transition-colors">
                    <span className="text-xl font-bold text-[#2F67FA] group-hover:text-white">
                      $
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  USDT Wallet
                </h3>

                <p className="text-sm text-gray-600 mb-2">
                  Withdraw Tether (USDT)
                </p>

                <p className="text-lg font-semibold text-foreground">
                  {loadingBalances ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    `$${walletBalances.USDT.toLocaleString()}`
                  )}
                </p>
              </button>
            </div>

            {/* Back button for step 1 */}

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}

        {/* Step 2: Select Destination */}

        {currentStep === 2 && selectedWallet === "NGN_NOMBA" && (
          // NEW: destination step for the Nomba flow. Its own bank picker
          // (sourced from Nomba's own bank list, never SUPPORTED_BANKS) and
          // its own account number / account name fields — nothing here is
          // shared with the CNGN bankAccounts list below.
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Recipient Bank Account
              </h2>
              <p className="text-gray-600">Where should we send the money?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nomba-bank">Bank</Label>
                <select
                  id="nomba-bank"
                  className="w-full border rounded-md h-10 px-3 text-sm"
                  value={nombaBankCode}
                  onChange={(e) => setNombaBankCode(e.target.value)}
                  disabled={loadingNombaBanks}
                >
                  <option value="">
                    {loadingNombaBanks ? "Loading banks..." : "Select a bank"}
                  </option>
                  {nombaBanks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {!loadingNombaBanks && nombaBanks.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Could not load the bank list. Please try again shortly.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="nomba-account-number">Account Number</Label>
                <Input
                  id="nomba-account-number"
                  value={nombaAccountNumber}
                  onChange={(e) =>
                    setNombaAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="0123456789"
                  inputMode="numeric"
                />
              </div>

              <div>
                <Label htmlFor="nomba-account-name">Account Name</Label>
                <Input
                  id="nomba-account-name"
                  value={nombaAccountName}
                  onChange={(e) => setNombaAccountName(e.target.value)}
                  placeholder="As it appears on the bank account"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Double-check this matches the account exactly — an incorrect
                  name can cause the transfer to fail or be rejected by the
                  bank.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!canContinueNombaDestination}
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && selectedWallet && selectedWallet !== "NGN_NOMBA" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Select Destination
              </h2>

              <p className="text-gray-600">
                {selectedWallet === "NGN"
                  ? "Choose a bank account"
                  : "Choose a wallet address"}
              </p>
            </div>

            <div className="space-y-3">
              {selectedWallet === "NGN" ? (
                loadingAccounts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2F67FA]" />

                    <span className="ml-2 text-gray-600">
                      Loading bank accounts...
                    </span>
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No bank accounts added yet.</p>

                    <p className="text-sm">
                      Add a bank account to withdraw funds.
                    </p>
                  </div>
                ) : (
                  bankAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => {
                        setSelectedDestination(account.id);

                        setCurrentStep(3);
                      }}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#2F67FA] hover:bg-[#2F67FA]/5 transition-all duration-200 text-left"
                    >
                      <p className="font-semibold text-foreground mb-1">
                        {account.accountName}
                      </p>

                      <p className="text-sm text-gray-600 font-mono">
                        {account.accountNumber} • {account.bankName}
                      </p>
                    </button>
                  ))
                )
              ) : loadingWallets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2F67FA]" />
                  <span className="ml-2 text-gray-600">Loading wallets...</span>
                </div>
              ) : withdrawalWallets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No withdrawal wallets added yet.</p>
                  <p className="text-sm">
                    Add a wallet address to withdraw crypto.
                  </p>
                </div>
              ) : (
                withdrawalWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => {
                      setSelectedDestination(wallet.id);
                      setCurrentStep(3);
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#2F67FA] hover:bg-[#2F67FA]/5 transition-all duration-200 text-left"
                  >
                    <p className="font-semibold text-foreground mb-1">
                      {wallet.name}
                    </p>
                    <p className="text-sm text-gray-600 font-mono">
                      {wallet.address}
                    </p>
                    <p className="text-xs text-gray-400">
                      {wallet.asset} • {wallet.network}
                    </p>
                  </button>
                ))
              )}

              {selectedWallet === "NGN" ? (
                <AddAccountDialog onAccountAdded={handleAccountAdded}>
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#2F67FA] hover:bg-[#2F67FA]/5 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-[#2F67FA]">
                    <Plus className="w-5 h-5" />

                    <span className="font-medium">Add New Bank Account</span>
                  </button>
                </AddAccountDialog>
              ) : (
                <AddWalletDialog onWalletAdded={handleWalletAdded}>
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#2F67FA] hover:bg-[#2F67FA]/5 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-[#2F67FA]">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add New Wallet</span>
                  </button>
                </AddWalletDialog>
              )}
            </div>

            {/* Add back button for step 2 */}

            <Button
              onClick={() => setCurrentStep(1)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}

        {/* Step 3: Enter Amount */}

        {currentStep === 3 && selectedWallet && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Enter Amount
              </h2>

              <p className="text-gray-600">How much do you want to withdraw?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">
                  Amount ({isNairaFlow ? "NGN" : selectedWallet})
                </Label>

                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              {amount && (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount</span>

                      <span className="font-medium text-foreground">
                        {isNairaFlow ? "₦" : "$"}

                        {Number.parseFloat(amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transaction Fee</span>

                      <span className="font-medium text-foreground">
                        {isNairaFlow ? "₦" : "$"}

                        {fee.toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>

                      <span className="font-semibold text-foreground">
                        {isNairaFlow ? "₦" : "$"}

                        {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* The NGN <-> USD conversion preview only makes sense for
                      the existing CNGN/USDT flows, which cross currencies.
                      The Nomba flow pays out NGN as NGN, so it's skipped. */}
                  {selectedWallet !== "NGN_NOMBA" && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">
                        You will receive
                      </p>

                      <p className="text-lg font-semibold text-foreground">
                        {selectedWallet === "NGN"
                          ? `$${convertCurrency(Number.parseFloat(amount), "NGN", "USD").toFixed(2)}`
                          : `₦${convertCurrency(Number.parseFloat(amount), "USDT", "NGN").toFixed(2)}`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleInitiateWithdrawal}
                disabled={!amount || Number.parseFloat(amount) <= 0 || loading}
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Verify OTP */}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Verify OTP
              </h2>

              <p className="text-gray-600">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <div className="flex justify-center">
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-12 text-center text-lg font-semibold"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    data-index={index}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <button className="text-sm text-[#2F67FA] hover:text-[#2F67FA]/80 font-medium">
                Resend Code
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep(3)}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleCompleteWithdrawal}
                disabled={loading || otp.join("").length !== 6}
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Complete"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}

        {currentStep === 5 && (
          <div className="space-y-6 text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-in zoom-in duration-500">
              <Sparkles className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Withdrawal Successful!
              </h2>

              <p className="text-gray-600">
                Your withdrawal of {isNairaFlow ? "₦" : "$"}
                {amount} is being processed.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                Transaction Reference
              </p>

              <p className="text-sm font-mono font-medium text-foreground">
                TXN-{Date.now()}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                asChild
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
              >
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}