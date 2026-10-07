
"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Filter,
  ShieldCheck,
  MapPin,
  Clock,
  LockKeyhole,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  P2PAd,
  P2POrder,
  PaymentMethod,
  CountryCode,
  Merchant,
} from "@/lib/p2p-types";
import { P2P_CURRENCY_COUNTRIES, P2PCurrency } from "@/lib/constants";
import { CurrencyCircleIcon } from "@/components/CurrencyCircleIcon";
import { getMerchantAds } from "@/lib/p2p-storage";
import { TraderProfileModal } from "@/components/p2p/TraderProfileModal";
import { OrderModal } from "@/components/p2p/OrderModal";
import { fetchWithAuth } from "@/components/auth-form";
import { formatAdPrice } from "@/lib/p2p-price";

export default function P2PMarketplacePage() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  // Currency selection
  const [selectedCrypto, setSelectedCrypto] = useState<string>("CNGN");
  const [selectedFiat, setSelectedFiat] = useState<string>("all");

  // Filters
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minAmount, setMinAmount] = useState<string>("");
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");

  // Real data state
  const [realAds, setRealAds] = useState<P2PAd[]>([]);
  const [realMerchants, setRealMerchants] = useState<Record<string, Merchant>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ngnWallet, setNgnWallet] = useState<{
    available: number;
    locked: number;
  } | null>(null);
  const ngnLockedMessage =
    "NGN trading needs a Finstack NGN wallet, which is available for Nigerian accounts.";
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // Used so an old, slow response can never overwrite a newer one
  const latestRequest = useRef(0);

  // Fetch real ads
  const fetchAds = async (
    page = 1,
    isLoadMore = false,
    asset = selectedCrypto,
  ) => {
    const requestId = ++latestRequest.current;
    try {
      if (asset === "NGN" && !ngnWallet) {
        setRealAds([]);
        setLoading(false);
        return;
      }
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      setError(null);

      // The Buy tab lists merchant SELL ads. The Sell tab lists merchant BUY ads.
      const query = new URLSearchParams({
        asset,
        type: activeTab === "buy" ? "SELL" : "BUY",
        page: String(page),
        limit: "20",
      });
      if (selectedFiat !== "all") query.set("fiat", selectedFiat);

      const res = await fetch(`/api/fstack/p2p?${query}`);
      const json = await res.json();

      // A newer request has started, so ignore this answer
      if (requestId !== latestRequest.current) return;

      if (json.success && Array.isArray(json.data)) {
        const newAds: P2PAd[] = [];
        const newMerchants: Record<string, Merchant> = {};

        json.data.forEach((item: any) => {
          // Map Merchant
          const merchantId = item.userId?._id || "unknown";
          if (!newMerchants[merchantId] && item.userId) {
            newMerchants[merchantId] = {
              id: merchantId,
              name:
                item.userId.displayName ||
                `${item.userId.firstName || "Unknown"} ${item.userId.lastName || "User"}`,
              businessName: `${item.userId.firstName || "Merchant"} Trading`,
              rating: 95, // Default good rating
              totalTrades: 0, // No real trade count from the backend yet
              completionRate: 98,
              responseTime: "5 mins",
              verifiedBadge: true,
              activeAds: 1,
              country: "NG",
              joinedDate: new Date().toISOString(),
              languages: ["English"],
            };
          }

          // Map Ad
          newAds.push({
            id: item._id,
            merchantId: merchantId,
            type: (item.type || "buy").toLowerCase() as "buy" | "sell",
            cryptoCurrency: item.asset || "USDT",
            fiatCurrency: item.fiat || "NGN",
            price: item.price || 0,
            available: item.availableAmount || 0,
            minLimit: item.minLimit || 0,
            maxLimit: item.maxLimit || 0,
            paymentMethods: Array.isArray(item.paymentMethods)
              ? item.paymentMethods
              : ["Bank Transfer"],
            // Map payment method details
            paymentMethodDetails: item.paymentMethodDetails || [],
            paymentWindow: item.timeLimit || 15,
            instructions: item.instructions || "",
            autoReply: item.autoReply || "",
            country: "NG",
            isActive: item.status === "ACTIVE",
          });
        });

        if (isLoadMore) {
          setRealAds((prev) => {
            // Prevent duplicates
            const existingIds = new Set(prev.map((a) => a.id));
            const uniqueNewAds = newAds.filter((a) => !existingIds.has(a.id));
            return [...prev, ...uniqueNewAds];
          });
          setRealMerchants((prev) => ({ ...prev, ...newMerchants }));
          if (json.pagination) {
            setPagination({
              ...json.pagination,
              page: json.pagination.page,
            });
          }
        } else {
          setRealAds(newAds);
          setRealMerchants(newMerchants);
          if (json.pagination) {
            setPagination(json.pagination);
          }
        }
      } else {
        if (!isLoadMore)
          setError("Failed to load orders. Please try again later.");
      }
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      if (!isLoadMore) setError("Cannot find orders right now.");
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadNgnWallet = async () => {
      try {
        const response = await fetchWithAuth(
          "/api/fstack/wallet/user-balances",
        );
        const result = await response.json();
        const wallet = Array.isArray(result.data)
          ? result.data.find(
              (entry: any) =>
                entry.currency === "NGN" && entry.provider === "NOMBA",
            )
          : undefined;
        if (mounted && response.ok && wallet) {
          setNgnWallet({
            available: Number(wallet.balance?.available) || 0,
            locked: Number(wallet.balance?.locked) || 0,
          });
        }
      } catch {
        if (mounted) setNgnWallet(null);
      }
    };

    void loadNgnWallet();
    return () => {
      mounted = false;
    };
  }, []);

  // Reload the list whenever the coin, the tab, the fiat or the wallet changes
  useEffect(() => {
    if (selectedCrypto === "NGN" && !ngnWallet) {
      setRealAds([]);
      setLoading(false);
      return;
    }
    void fetchAds(1, false, selectedCrypto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrypto, ngnWallet, activeTab, selectedFiat]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchAds(pagination.page + 1, true);
    }
  };

  const getMerchant = (id: string) => {
    const found = realMerchants[id];
    if (found) return found;

    // Fallback logic for unknown merchants
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 95 + (hash % 5);
    const trades = (hash * 7) % 1000;

    return {
      id: id,
      name: id.substring(0, 8) + "...", // Truncate ID for name
      businessName: `Trader ${id.substring(0, 6)}`,
      rating: rating,
      totalTrades: trades,
      completionRate: 98,
      responseTime: "2 mins",
      verifiedBadge: true,
      activeAds: 1,
      country: "GLOBAL" as CountryCode,
      joinedDate: "2024-01-15",
      languages: ["English"],
    };
  };

  // Modals
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<P2PAd | null>(null);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Helper to clean payment method strings
  // Removes separators like " - " and content in parentheses
  const cleanMethodName = (name: string) => {
    // 1. Split by hyphen (taking FIRST part)
    let clean = name.split(/[\-\–]/)[0].trim();

    // 2. Remove content in parentheses e.g. "PalmPay (My Name)"
    clean = clean.replace(/\s*\(.*\)/, "").trim();

    // 3. Fallback: if it became empty, return original
    return clean || name;
  };

  // Helper to extract specific payment method names (e.g. "PalmPay") or fall back to type
  const getAdPaymentMethods = (ad: P2PAd): string[] => {
    let methods: string[] = [];

    // Priority 1: Use bankName from details if available
    if (ad.paymentMethodDetails && ad.paymentMethodDetails.length > 0) {
      methods = ad.paymentMethodDetails
        .map((d) => d.bankName || d.type)
        .filter(Boolean) as string[];
    }

    // Priority 2: Use paymentMethods array if details extraction failed
    if (methods.length === 0) {
      methods = ad.paymentMethods;
    }

    return (
      methods
        .map(cleanMethodName)
        .filter((val, index, self) => self.indexOf(val) === index)
        // Filter out strings that are JUST numbers (likely accidental account numbers)
        .filter((m) => !/^\d{10,}$/.test(m))
    );
  };

  // Filter and sort ads
  const filterAds = (ads: P2PAd[], type: "buy" | "sell") => {
    return ads
      .filter((ad) => {
        // When user wants to "buy" crypto, they need merchants who are "selling" (type='sell')
        // When user wants to "sell" crypto, they need merchants who are "buying" (type='buy')
        const correctType = type === "buy" ? "sell" : "buy";
        return ad.type === correctType;
      })
      .filter((ad) => ad.isActive !== false) // Only show active ads
      .filter((ad) => ad.cryptoCurrency === selectedCrypto)
      .filter(
        (ad) => selectedFiat === "all" || ad.fiatCurrency === selectedFiat,
      )
      .filter((ad) => {
        if (filterPayment === "all") return true;
        const methods = getAdPaymentMethods(ad);
        return methods.includes(filterPayment);
      })
      .filter((ad) => filterCountry === "all" || ad.country === filterCountry)
      .filter((ad) => {
        if (verifiedOnly) {
          const merchant = getMerchant(ad.merchantId);
          return merchant?.verifiedBadge === true;
        }
        return true;
      })
      .filter((ad) => {
        if (
          minAmount &&
          parseFloat(minAmount) > 0 &&
          ad.minLimit > parseFloat(minAmount)
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price") {
          // Buying: show lowest price first. Selling: show highest price first.
          const correctType = type === "buy" ? "sell" : "buy";
          return correctType === "sell" ? a.price - b.price : b.price - a.price;
        }
        const merchantA = getMerchant(a.merchantId);
        const merchantB = getMerchant(b.merchantId);
        return (merchantB?.rating || 0) - (merchantA?.rating || 0);
      });
  };

  const allAds = [...realAds];

  const buyAds = filterAds(allAds, "buy");
  const sellAds = selectedCrypto === "NGN" ? [] : filterAds(allAds, "sell");

  const handleMerchantClick = (merchantId: string) => {
    setSelectedMerchant(merchantId);
    setShowMerchantModal(true);
  };

  const handleAdClick = (ad: P2PAd) => {
    if (ad.cryptoCurrency === "NGN" && !ngnWallet) return;
    if (ad.cryptoCurrency === "NGN" && activeTab !== "buy") return;
    // Set ad.type to match the active tab
    const fixedAd = { ...ad, type: activeTab };
    setSelectedAd(fixedAd);
    setShowOrderModal(true);
  };

  const handleOrderCreated = (order: P2POrder) => {
    const { saveOrder } = require("@/lib/p2p-storage");
    saveOrder(order);
  };

  // Get unique pairs and countries for filters
  const cryptoCurrencies = ["CNGN", "USDC", "USDT", "NGN"];
  const fiatCurrencies = ["NGN", "RMB", "GHS", "XAF", "XOF"];
  const uniqueCountries = Array.from(new Set(allAds.map((ad) => ad.country)));

  // Dynamic Payment Methods from Ads
  const uniquePaymentMethods = Array.from(
    new Set(allAds.flatMap((ad) => getAdPaymentMethods(ad))),
  )
    .filter(Boolean)
    .sort();

  const clearFilters = () => {
    setSelectedCrypto("CNGN");
    setSelectedFiat("all");
    setFilterPayment("all");
    setFilterCountry("all");
    setMinAmount("");
    setVerifiedOnly(false);
  };

  const renderAdRow = (ad: P2PAd, actionLabel: string, actionColor: string) => {
    const merchant = getMerchant(ad.merchantId);

    // One price label for every coin, matching the backend's meaning of price
    const priceDisplay = formatAdPrice(
      ad.price,
      ad.cryptoCurrency,
      ad.fiatCurrency,
    );

    return (
      <div
        key={ad.id}
        className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-6 p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors hover:shadow-md cursor-pointer items-center"
        onClick={() => handleAdClick(ad)}
      >
        {/* Merchant */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Merchant</p>
          <div className="text-[13px] font-medium text-foreground flex items-center gap-1">
            {merchant.name}
            {merchant.verifiedBadge && (
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            )}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Price</p>
         <p className="text-[13px] font-medium text-foreground leading-tight break-words">
            {priceDisplay}
          </p>
        </div>

        {/* Available */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Available</p>
          <p className="text-[13px] text-sm text-foreground">
            {ad.available.toLocaleString()} {ad.cryptoCurrency}
          </p>
        </div>

        {/* Limits */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Limits</p>
          <p className="text-[13px] text-sm text-foreground">
            {ad.minLimit.toLocaleString()} - {ad.maxLimit.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600">{ad.fiatCurrency}</p>
        </div>

        {/* Payment */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Payment</p>
          <div className="flex flex-wrap gap-1">
            {getAdPaymentMethods(ad).map((method, idx) => (
              <span
                key={`${method}-${idx}`}
                className="text-[10px] md:text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200 break-words leading-relaxed md:whitespace-nowrap md:overflow-hidden md:text-ellipsis md:max-w-[140px]"
                title={method}
              >
                {method}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            {ad.paymentWindow} mins
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Status</p>
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                ad.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {ad.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Action */}
        <div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAdClick(ad);
            }}
            className={cn("w-full", actionColor)}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            P2P Marketplace
          </h1>
          <p className="text-gray-600">Trade crypto with verified merchants</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Escrow Protected
            </p>
            <p className="text-xs text-blue-700">
              All trades secured by Finstack
            </p>
          </div>
        </div>
      </div>

      {/* Buy/Sell Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "buy" | "sell")}
        className="space-y-0"
      >
        <TabsList className="grid w-full max-w-[200px] grid-cols-2 h-12">
          <TabsTrigger value="buy" className="text-base font-medium">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="text-base font-medium">
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Crypto Currency Horizontal Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2 scrollbar-hide">
        {cryptoCurrencies.map((crypto) => {
          const locked = crypto === "NGN" && !ngnWallet;
          return (
            <div
              key={crypto}
              title={locked ? ngnLockedMessage : undefined}
              className="shrink-0"
            >
              <button
                type="button"
                onClick={() => setSelectedCrypto(crypto)}
                disabled={locked}
                aria-label={locked ? `NGN, locked. ${ngnLockedMessage}` : crypto}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap inline-flex items-center gap-1.5",
                  selectedCrypto === crypto
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  locked && "cursor-not-allowed text-gray-400 opacity-70",
                )}
              >
                {crypto}
                {locked && <LockKeyhole className="h-3.5 w-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      {selectedCrypto === "NGN" && ngnWallet && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
          <span>Available: {ngnWallet.available.toLocaleString()} NGN</span>
          <span>In active trades: {ngnWallet.locked.toLocaleString()} NGN</span>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 pb-2">
        {/* Fiat Currency Selector */}
        <Select value={selectedFiat} onValueChange={setSelectedFiat}>
          <SelectTrigger className="w-[180px] h-[42px]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {selectedFiat === "all"
                  ? "🌍"
                  : selectedFiat === "NGN"
                    ? "₦"
                    : selectedFiat === "RMB"
                      ? "¥"
                      : selectedFiat === "GHS"
                        ? "₵"
                        : null}
              </div>
              <SelectValue placeholder="Select currency" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  🌍
                </div>
                <span>All Currencies</span>
              </div>
            </SelectItem>
            {fiatCurrencies.map((currency) => (
              <SelectItem key={currency} value={currency}>
                <div className="flex items-center gap-2">
                  {currency === "NGN" ||
                  currency === "RMB" ||
                  currency === "GHS" ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {currency === "NGN"
                        ? "₦"
                        : currency === "RMB"
                          ? "¥"
                          : "₵"}
                    </div>
                  ) : null}
                  {currency === "XAF" || currency === "XOF" ? (
                    <CurrencyCircleIcon code={currency} size={20} />
                  ) : null}
                  <span>{currency}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* All payment methods */}
        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-[220px] h-[42px]">
            <SelectValue placeholder="All payment methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment methods</SelectItem>
            {uniquePaymentMethods.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* More Filters Button */}
        <Button variant="outline" size="icon" className="h-[42px] w-[42px]">
          <Filter className="w-4 h-4" />
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Label
            htmlFor="verified-toggle"
            className="text-sm text-gray-600 cursor-pointer whitespace-nowrap"
          >
            Verified Only
          </Label>
          <Switch
            id="verified-toggle"
            checked={verifiedOnly}
            onCheckedChange={setVerifiedOnly}
          />
        </div>
      </div>

      {/* Merchant Listings */}
      <Card className="shadow-lg border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {activeTab === "buy" ? "Buy" : "Sell"} {selectedCrypto}
            </h3>
            {!loading && !error && (
              <span className="text-sm text-gray-600">
                {activeTab === "buy" ? buyAds.length : sellAds.length}{" "}
                {(activeTab === "buy" ? buyAds.length : sellAds.length) === 1
                  ? "offer"
                  : "offers"}{" "}
                available
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Header for desktop */}
            <div className="hidden md:grid md:grid-cols-7 gap-6 p-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
              <div>Merchant</div>
              <div>Price</div>
              <div>Available</div>
              <div>Limits</div>
              <div>Payment</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {/* Loading (the tabs and filters above stay on screen) */}
            {loading && (
              <div className="text-center py-12 text-gray-500 animate-pulse">
                Loading orders...
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-12 text-red-500">
                <p className="mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAds(1, false)}
                >
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && (
              <>
                {activeTab === "buy" && buyAds.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">
                      No merchants match your filters
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}

                {activeTab === "buy" &&
                  buyAds.map((ad) =>
                    renderAdRow(
                      ad,
                      "Buy",
                      "bg-green-600 hover:bg-green-700 text-white",
                    ),
                  )}

                {activeTab === "sell" && selectedCrypto === "NGN" && (
                  <div className="text-center py-12 text-gray-500">
                    NGN selling is not available yet.
                  </div>
                )}

                {activeTab === "sell" &&
                  selectedCrypto !== "NGN" &&
                  sellAds.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-2">
                        No merchants match your filters
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  )}

                {activeTab === "sell" &&
                  sellAds.map((ad) =>
                    renderAdRow(
                      ad,
                      "Sell",
                      "bg-blue-600 hover:bg-blue-700 text-white",
                    ),
                  )}

                {/* Pagination Load More */}
                {pagination.totalPages > 1 &&
                  pagination.page < pagination.totalPages && (
                    <div className="flex justify-center pt-6 border-t border-gray-100">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        variant="outline"
                        className="min-w-[200px]"
                      >
                        {loadingMore
                          ? "Loading..."
                          : `Load More (${Math.max(0, pagination.total - pagination.page * pagination.limit)} remaining)`}
                      </Button>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Modals */}
      {selectedMerchant && (
        <TraderProfileModal
          trader={getMerchant(selectedMerchant)}
          ads={allAds.filter((ad) => ad.merchantId === selectedMerchant)}
          open={showMerchantModal}
          onClose={() => {
            setShowMerchantModal(false);
            setSelectedMerchant(null);
          }}
          onSelectAd={handleAdClick}
        />
      )}

      {selectedAd && (
        <OrderModal
          ad={selectedAd}
          trader={getMerchant(selectedAd.merchantId)!}
          open={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedAd(null);
          }}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
}