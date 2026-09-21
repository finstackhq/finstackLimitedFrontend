"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/dashboard/stepper";
import {
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Banknote,
  Bitcoin,
  AlertCircle,
  ChevronRight,
  Building2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DepositMethod = "crypto" | "naira";
type Stablecoin = "USDC" | "CNGN";
type Step = 0 | 1 | 2;

interface NgnWallet {
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DepositPage() {
  // ── Navigation state ──
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [depositMethod, setDepositMethod] = useState<DepositMethod | null>(
    null,
  );

  // ── Crypto deposit state ──
  const [selectedWallet, setSelectedWallet] = useState<Stablecoin | null>(null);
  const [cryptoAddress, setCryptoAddress] = useState<string | null>(null);
  const [cryptoNetwork, setCryptoNetwork] = useState<string>("");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // ── NGN Nomba state ──
  const [ngnWallet, setNgnWallet] = useState<NgnWallet | null>(null);
  const [hasNgnWallet, setHasNgnWallet] = useState<boolean | null>(null);

  // ── Shared UI state ──
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Check if user has NGN wallet on mount ──
  useEffect(() => {
    const checkNgnWallet = async () => {
      try {
        const res = await fetch("/api/fstack/deposit?currency=NGN");
        const data = await res.json();
        setHasNgnWallet(data.success === true);
      } catch {
        setHasNgnWallet(false);
      }
    };
    checkNgnWallet();
  }, []);

  // ─── Step config ───────────────────────────────────────────────────────────

  const CRYPTO_STEPS = [
    { number: 1, title: "Method" },
    { number: 2, title: "Select Asset" },
    { number: 3, title: "Address" },
  ];

  const NGN_STEPS = [
    { number: 1, title: "Method" },
    { number: 2, title: "Account Details" },
  ];

  const steps = depositMethod === "naira" ? NGN_STEPS : CRYPTO_STEPS;
  const displayStep = currentStep === 0 ? 1 : currentStep + 1;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleMethodSelect = (method: DepositMethod) => {
    setDepositMethod(method);
    setError(null);
    if (method === "naira") {
      fetchNgnAccount();
    } else {
      setCurrentStep(1);
    }
  };

  const fetchNgnAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fstack/deposit?currency=NGN");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load your NGN deposit account",
        );
      }
      setNgnWallet({
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        bankName: data.bankName,
      });
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || "Failed to load your NGN deposit account");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositAddress = async (currency: string) => {
    const res = await fetch(`/api/fstack/deposit?currency=${currency}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(
        data.error || data.message || "Failed to fetch deposit details",
      );
    }
    return data;
  };

  const handleCryptoDeposit = async () => {
    if (!selectedWallet) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDepositAddress(selectedWallet);
      setCryptoAddress(data.address!);
      setCryptoNetwork(data.network || "BASE");
      setCryptoCurrency(data.currency);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to fetch deposit address");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep === 0) {
      window.history.back();
    } else if (currentStep === 1) {
      setCurrentStep(0);
      setDepositMethod(null);
      setSelectedWallet(null);
      setNgnWallet(null);
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setCryptoAddress(null);
      setAcknowledged(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Deposit Funds
        </h1>
        <p className="text-gray-600 mt-1">Add money to your wallet</p>
      </div>

      <Stepper steps={steps} currentStep={displayStep} />

      <Card className="max-w-2xl mx-auto p-6 shadow-lg border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ══ STEP 0: Choose Method ════════════════════════════════════════════ */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Choose Deposit Method
              </h2>
              <p className="text-gray-600 text-sm">
                Select how you want to deposit funds
              </p>
            </div>

            <div
              className={`grid gap-4 ${hasNgnWallet ? "md:grid-cols-2" : "md:grid-cols-1 max-w-sm mx-auto"}`}
            >
              {/* Crypto — always shown */}
              <button
                onClick={() => handleMethodSelect("crypto")}
                disabled={loading}
                className="p-6 border-2 rounded-xl transition-all duration-200 text-left group border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-[#2F67FA]/10 group-hover:bg-[#2F67FA] text-[#2F67FA] group-hover:text-white mb-4">
                  <Bitcoin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Deposit Crypto
                </h3>
                <p className="text-sm text-gray-500">
                  Send USDC or CNGN directly to your wallet address
                </p>
              </button>

              {/* NGN — only shown if user has an NGN wallet */}
              {hasNgnWallet && (
                <button
                  onClick={() => handleMethodSelect("naira")}
                  disabled={loading}
                  className="p-6 border-2 rounded-xl transition-all duration-200 text-left group border-gray-200 hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-green-100 group-hover:bg-green-600 text-green-600 group-hover:text-white mb-4">
                    {loading && depositMethod === "naira" ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Banknote className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    Deposit with Naira
                  </h3>
                  <p className="text-sm text-gray-500">
                    Transfer NGN to your dedicated bank account
                  </p>
                </button>
              )}
            </div>

            {error && <ErrorBox message={error} />}

            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        )}

        {/* ══ STEP 1 (CRYPTO): Select Asset ═══════════════════════════════════ */}
        {currentStep === 1 && depositMethod === "crypto" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Select Asset
              </h2>
              <p className="text-gray-600 text-sm">
                Choose which stablecoin you want to deposit
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {(["USDC", "CNGN"] as Stablecoin[]).map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedWallet(coin)}
                  className={`p-6 border-2 rounded-xl transition-all duration-200 text-left group ${
                    selectedWallet === coin
                      ? "border-[#2F67FA] bg-[#2F67FA]/5"
                      : "border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-xl transition-colors ${
                      selectedWallet === coin
                        ? "bg-[#2F67FA] text-white"
                        : "bg-[#2F67FA]/10 text-[#2F67FA] group-hover:bg-[#2F67FA] group-hover:text-white"
                    }`}
                  >
                    {coin === "USDC" ? "$" : "₦"}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {coin}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {coin === "USDC"
                      ? "USD Coin on Base"
                      : "Crypto Naira on Base"}
                  </p>
                </button>
              ))}
            </div>

            {error && <ErrorBox message={error} />}

            <div className="flex flex-col gap-3">
              {selectedWallet && (
                <Button
                  onClick={handleCryptoDeposit}
                  disabled={loading}
                  className="w-full bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching
                      Address…
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 (CRYPTO): Deposit Address ════════════════════════════════ */}
        {currentStep === 2 && depositMethod === "crypto" && cryptoAddress && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#2F67FA]/10 flex items-center justify-center mx-auto mb-3">
                <Bitcoin className="w-7 h-7 text-[#2F67FA]" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {cryptoCurrency} Deposit Address
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Send {cryptoCurrency} only on the{" "}
                <span className="font-semibold">{cryptoNetwork}</span> network
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-[#2F67FA] px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {cryptoCurrency} Wallet
                  </p>
                  <p className="text-white/70 text-xs">
                    {cryptoNetwork} Network
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-5 space-y-4">
                <DetailRow label="Network" value={cryptoNetwork} />
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 mt-1.5">
                    <span className="text-xs font-mono text-foreground break-all flex-1 leading-relaxed">
                      {cryptoAddress}
                    </span>
                    <button
                      onClick={() => copyToClipboard(cryptoAddress, "address")}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-[#2F67FA]/10 text-[#2F67FA] transition-colors"
                    >
                      {copiedField === "address" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="mt-2 text-xs text-[#2F67FA] hover:underline"
                  >
                    {showQR ? "Hide QR Code" : "Show QR Code"}
                  </button>
                  {showQR && (
                    <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl inline-block">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(cryptoAddress)}`}
                        alt="QR Code"
                        className="w-40 h-40"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <WarningBox>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>
                  Only send {cryptoCurrency} on the {cryptoNetwork} network
                </li>
                <li>Sending other assets may result in permanent loss</li>
                <li>Minimum deposit: 10 {cryptoCurrency}</li>
              </ul>
            </WarningBox>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="rounded"
              />
              I confirm I will only send {cryptoCurrency} on the {cryptoNetwork}{" "}
              network
            </label>

            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                asChild
                disabled={!acknowledged}
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <a href="/dashboard">Done</a>
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 1 (NGN): Permanent Nomba Account ═══════════════════════════ */}
        {currentStep === 1 && depositMethod === "naira" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Your NGN Deposit Account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Transfer any amount to this account to fund your wallet
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8 gap-3 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading your deposit account…</span>
              </div>
            )}

            {!loading && error && <ErrorBox message={error} />}

            {!loading && ngnWallet && (
              <>
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-linear-to-r from-green-600 to-green-500 px-5 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {ngnWallet.bankName || "Virtual Account"}
                      </p>
                      <p className="text-white/70 text-xs">
                        Nigerian Naira · Bank Transfer
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 space-y-4">
                    <DetailRow
                      label="Bank Name"
                      value={ngnWallet.bankName || "—"}
                    />
                    <DetailRow
                      label="Account Name"
                      value={ngnWallet.accountName || "—"}
                    />
                    <div>
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Number
                      </Label>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 mt-1.5">
                        <span className="text-2xl font-mono font-bold tracking-[0.2em] text-foreground flex-1">
                          {ngnWallet.accountNumber}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              ngnWallet.accountNumber ?? "",
                              "accountNumber",
                            )
                          }
                          className="shrink-0 p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                        >
                          {copiedField === "accountNumber" ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {copiedField === "accountNumber" && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          ✓ Account number copied
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-blue-800">
                    How this works
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1.5 list-disc list-inside">
                    <li>
                      Transfer any NGN amount via bank app, USSD, or internet
                      banking
                    </li>
                    <li>
                      Your NGN balance will be credited automatically within
                      minutes
                    </li>
                    <li>
                      This account is permanent — use it for all your NGN
                      deposits
                    </li>
                    <li>Only send NGN — no foreign currencies</li>
                  </ul>
                </div>

                <WarningBox>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>
                      Only send NGN to this account — no foreign currencies
                    </li>
                    <li>
                      Always use this exact account number — it is unique to
                      your profile
                    </li>
                    <li>
                      Do not send from a third-party account — use only your own
                      bank
                    </li>
                  </ul>
                </WarningBox>
              </>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {!loading && ngnWallet && (
                <Button
                  asChild
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <a href="/dashboard">Done</a>
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </Label>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-yellow-800 mb-1">
            Important
          </h4>
          {children}
        </div>
      </div>
    </div>
  );
}
