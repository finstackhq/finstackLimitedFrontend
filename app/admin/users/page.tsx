"use client";

import React, { useEffect, useState } from "react";
import type { JSX } from "react";
import { UsersTable } from "@/components/admin/UsersTable";
import { UsersFilter } from "@/components/admin/UsersFilter";

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  country: string;
  balance: number;
  currency: string;
  kycStatus: string;
  status: string;
  joinedAt: string;
  role?: string;
  balances?: any[];
  totalBalance?: number;
  howYouHeardAboutUs?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  // Tip: Keep filteredUsers for client-side search, but initialize with the fetched users
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    kycStatus: "all",
  });

  const [showReferralTable, setShowReferralTable] = useState(true);
  const [allReferralUsers, setAllReferralUsers] = useState<any[]>([]);

  // Icon mapping for sources
  const referralIcons: Record<string, JSX.Element> = {
    YouTube: (
      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.413 3.5 12 3.5 12 3.5s-7.413 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.16 0 12 0 12s0 3.84.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.587 20.5 12 20.5 12 20.5s7.413 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.84 24 12 24 12s0-3.84-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    Google: (
      <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.35 11.1h-9.18v2.98h5.24c-.22 1.18-1.34 3.47-5.24 3.47-3.15 0-5.72-2.61-5.72-5.82s2.57-5.82 5.72-5.82c1.8 0 3.01.77 3.7 1.43l2.53-2.46C17.09 3.88 14.97 2.8 12.5 2.8 6.98 2.8 2.5 7.28 2.5 12.8s4.48 10 10 10c5.74 0 9.5-4.02 9.5-9.7 0-.65-.07-1.27-.15-1.9z" />
      </svg>
    ),
    TikTok: (
      <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.9 2.9 0 0 1-2.9-2.9 2.89 2.89 0 0 1 2.9-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.35 6.34 6.34 0 0 0 6.35-6.35V8.87a8.27 8.27 0 0 0 4.85 1.56V6.99a4.85 4.85 0 0 1-1.1-.3z" />
      </svg>
    ),
    Instagram: (
      <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    Friend: (
      <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    "Friend / Family": (
      <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    WhatsApp: (
      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.377.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347z" />
      </svg>
    ),
    Facebook: (
      <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.104C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" />
      </svg>
    ),
    "Social Media": (
      <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
          SM
        </text>
      </svg>
    ),
    Online: (
      <svg className="w-5 h-5 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    Pinterest: (
      <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.12-2.48.02-3.55.13-.97.87-6.26.87-6.26s-.22-.44-.22-1.09c0-1.02.59-1.78 1.33-1.78.63 0 .93.47.93 1.04 0 .63-.4 1.58-.61 2.46-.17.74.37 1.34 1.1 1.34 1.32 0 2.34-1.39 2.34-3.4 0-1.78-1.28-3.02-3.1-3.02-2.27 0-3.6 1.7-3.6 3.46 0 .69.26 1.42.59 1.82.07.08.08.15.06.23-.06.26-.2.83-.23.95-.04.16-.13.2-.3.12-1.12-.52-1.82-2.15-1.82-3.47 0-2.82 2.05-5.41 5.91-5.41 3.1 0 5.52 2.21 5.52 5.17 0 3.08-1.94 5.56-4.64 5.56-.91 0-1.76-.47-2.05-1.03l-.56 2.13c-.2.78-.75 1.76-1.12 2.36A12 12 0 1 0 12 0z"/>
      </svg>
    ),
    Other: (
      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">
          •••
        </text>
      </svg>
    ),
    Unknown: (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">
          ?
        </text>
      </svg>
    ),
  };

  // Helper to normalize referral text
  const normalizeReferral = (raw?: string): string => {
    if (!raw || typeof raw !== "string") return "Unknown";
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "—" || trimmed.toLowerCase() === "unknown") return "Unknown";

    const lower = trimmed.toLowerCase();

    // YouTube variations
    if (
      lower.includes("youtube") || 
      lower.includes("utube") || 
      lower.includes("youtub") || 
      lower === "yt"
    ) return "YouTube";

    // Google / Search variations
    if (
      lower.includes("google") || 
      lower.includes("goggle") || 
      lower.includes("gogle") || 
      lower.includes("search engine") || 
      lower === "g"
    ) return "Google";

    // TikTok
    if (lower.includes("tiktok") || lower.includes("tik tok") || lower.includes("tik-tok")) return "TikTok";

    // Instagram
    if (lower.includes("instagram") || lower === "ig" || lower.startsWith("ig ") || lower.endsWith(" ig")) return "Instagram";

    // Facebook
    if (lower.includes("facebook") || lower === "fb" || lower.startsWith("fb ")) return "Facebook";

    // WhatsApp
    if (lower.includes("whatsapp") || lower.includes("whatsap")) return "WhatsApp";

    // Friends & Family
    if (lower.includes("friend") || lower.includes("family") || lower.includes("word of mouth")) return "Friend";

    // Social Media general
    if (
      lower.includes("social media") || 
      lower.includes("réseaux sociaux") || 
      lower.includes("reseaux sociaux") || 
      lower === "media"
    ) return "Social Media";

    // Online / Web
    if (lower.includes("online") || lower.includes("web") || lower.includes("internet")) return "Online";

    // Pinterest
    if (lower.includes("pinterest")) return "Pinterest";

    // Low-value / spam answers
    if (
      lower === "0" || 
      lower === "haha" || 
      lower === "doesn't matter" || 
      lower === "i just find out" || 
      lower.startsWith("non illo")
    ) {
      return "Other";
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // const fetchUsers = async () => {
  //   setLoading(true);
  //   try {
  //     const queryParams = new URLSearchParams({
  //       page: currentPage.toString(),
  //       limit: limit.toString(),
  //       // These ensure the backend does the filtering before paginating
  //       status: filters.status !== "all" ? filters.status : "",
  //       kycStatus: filters.kycStatus !== "all" ? filters.kycStatus : "",
  //     });

  //     const response = await fetch(`/api/admin/users?${queryParams}`, {
  //       credentials: "include",
  //     });

  //     const data = await response.json();

  //     if (response.ok && data.users) {
  //       const mappedUsers: User[] = data.users.map((u: any) => ({
  //         ...u,
  //         id: u._id,
  //         name: u.fullname || "N/A",
  //         joinedAt: u.createdAt || new Date().toISOString(),
  //         balance: u.totalBalance || 0,
  //         currency: "USD",
  //         kycStatus: (u.kycStatus || "PENDING").toUpperCase(),
  //         status: u.status || "active",
  //       }));

  //       setUsers(mappedUsers);
  //       setFilteredUsers(mappedUsers); // CRITICAL: This makes the users appear in the table
  //       setTotalUsers(data.totalUsers || 0);
  //       setTotalPages(data.totalPages || 1);
  //     } else {
  //       setUsers([]);
  //       setFilteredUsers([]);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch users:", error);
  //     setUsers([]);
  //     setFilteredUsers([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
      });

      if (filters.status !== "all") {
        queryParams.set("status", filters.status);
      }
      if (filters.kycStatus !== "all") {
        queryParams.set("kycStatus", filters.kycStatus);
      }

      const response = await fetch(
        `/api/admin/users?${queryParams.toString()}`,
      );
      const data = await response.json();

      // Only handle paginated object response
      if (response.ok && data.users && Array.isArray(data.users)) {
        const mappedUsers: User[] = data.users.map((u: any) => ({
          id: u.id || u._id,
          _id: u._id || u.id,
          name: u.name || u.fullname || "N/A",
          email: u.email,
          country: u.country || "—",
          status: u.status || "active",
          joinedAt: u.joinedAt || u.createdAt,
          kycStatus: u.kycStatus || "pending",
          balance: u.totalBalance || 0,
          currency: "NGN",
          role: u.role,
          balances: u.balances || [],
          howYouHeardAboutUs: u.howYouHeardAboutUs,
        }));
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
        setTotalUsers(data.totalUsers || mappedUsers.length);
        setTotalPages(data.totalPages || 1);
      } else {
        setUsers([]);
        setFilteredUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch {
      setUsers([]);
      setFilteredUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, limit, filters.status, filters.kycStatus]);

  // Fetch global user referrals for accurate summary across all pages
  useEffect(() => {
    const fetchAllReferrals = async () => {
      try {
        const response = await fetch("/api/admin/users?limit=1000");
        const data = await response.json();
        if (response.ok && data.users && Array.isArray(data.users)) {
          setAllReferralUsers(data.users);
        }
      } catch {
        // Silently fall back to paginated users list
      }
    };
    fetchAllReferrals();
  }, []);

  // Client-side search filtering
  useEffect(() => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [filters.search, users]);

  const handleUserAction = async (
    id: string,
    action: "suspend" | "activate" | "delete",
  ) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (response.ok) fetchUsers();
    } catch {
      // noop
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/update-role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (response.ok) fetchUsers();
    } catch (error) {
      throw error;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  // Aggregate referral sources
  const sourcePool = allReferralUsers.length > 0 ? allReferralUsers : users;
  const referralCounts: Record<string, number> = {};
  sourcePool.forEach((u: any) => {
    const referral = normalizeReferral(u.howYouHeardAboutUs);
    referralCounts[referral] = (referralCounts[referral] || 0) + 1;
  });

  const totalReferralCount = Object.values(referralCounts).reduce((acc, c) => acc + c, 0);
  const sortedReferrals = Object.entries(referralCounts).sort((a, b) => b[1] - a[1]);
  const topChannels = sortedReferrals.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Collapsible Compact Referral Source Summary */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 mb-2 transition-all">
        <button
          className={`w-full flex items-center justify-between text-left focus:outline-none hover:text-blue-600 transition group cursor-pointer ${
            showReferralTable ? "mb-4" : ""
          }`}
          onClick={() => setShowReferralTable((v) => !v)}
          aria-expanded={showReferralTable}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`transition-transform duration-300 ${
                showReferralTable ? "rotate-45" : ""
              }`}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                className="text-blue-500"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path stroke="currentColor" strokeWidth="2" d="M8 12h8M12 8v8" />
              </svg>
            </span>
            <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
              Referral Source Summary
            </span>
            {totalReferralCount > 0 && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full font-medium">
                {totalReferralCount} responses tracked
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition shrink-0">
            {showReferralTable ? "Collapse" : "Expand Summary"}
          </span>
        </button>

        {showReferralTable && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-gray-100">
            {/* Left: Top 4 Quick-Glance Cards with Progress Bars (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Top Acquisition Channels
                </span>
                <span className="text-xs text-gray-400">
                  {topChannels.length} major sources
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topChannels.map(([source, count]) => {
                  const pct = Math.round((count / (totalReferralCount || 1)) * 100);
                  return (
                    <div
                      key={source}
                      className="bg-gray-50/70 border border-gray-200/70 rounded-xl p-3.5 hover:border-blue-300 hover:bg-blue-50/20 transition shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="shrink-0 p-1.5 rounded-lg bg-white border border-gray-200/60 shadow-2xs">
                            {referralIcons[source] || referralIcons.Unknown}
                          </div>
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {source}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500 ml-1">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200/70 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Compact Scrollable Breakdown of All Sources (5 cols on desktop) */}
            <div className="lg:col-span-5 bg-gray-50/70 border border-gray-200/70 rounded-xl p-3.5 flex flex-col">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200/60">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  All Sources ({sortedReferrals.length})
                </span>
                <span className="text-[11px] text-gray-400">Scroll to view all</span>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1.5">
                {sortedReferrals.map(([source, count]) => {
                  const pct = Math.round((count / (totalReferralCount || 1)) * 100);
                  return (
                    <div
                      key={source}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs hover:bg-white border border-transparent hover:border-gray-200/60 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0 scale-90">
                          {referralIcons[source] || referralIcons.Unknown}
                        </div>
                        <span className="font-medium text-gray-700 truncate">{source}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-bold text-blue-600">{count}</span>
                        <span className="text-gray-400 text-[11px] w-9 text-right font-mono">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Users Management
        </h1>
        <div className="text-xs md:text-sm text-gray-600">
          Showing {filteredUsers.length} of {totalUsers} total users
        </div>
      </div>

      <UsersFilter filters={filters} onFiltersChange={setFilters} />

      <UsersTable
        users={filteredUsers}
        onAction={handleUserAction}
        onRoleChange={handleRoleChange}
      />

      <div className="flex items-center justify-end gap-4 mt-4">
        <select
          className="mr-auto px-2 py-1 border rounded text-sm bg-white"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>

        <button
          className="px-3 py-1 rounded border bg-white disabled:opacity-30"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="px-3 py-1 rounded border bg-white disabled:opacity-30"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
