"use client";

import React, { useEffect, useState } from "react";
import type { JSX } from "react";
import { UsersTable } from "@/components/admin/UsersTable";
import { UsersFilter } from "@/components/admin/UsersFilter";

interface User {
  id: string;
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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    kycStatus: "all",
  });
  const [showReferralTable, setShowReferralTable] = useState(false);
  // Icon mapping for sources
  const referralIcons: Record<string, JSX.Element> = {
    YouTube: (
      <svg
        className="w-5 h-5 text-red-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.413 3.5 12 3.5 12 3.5s-7.413 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.16 0 12 0 12s0 3.84.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.587 20.5 12 20.5 12 20.5s7.413 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.84 24 12 24 12s0-3.84-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    Google: (
      <svg
        className="w-5 h-5 text-blue-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M21.35 11.1h-9.18v2.98h5.24c-.22 1.18-1.34 3.47-5.24 3.47-3.15 0-5.72-2.61-5.72-5.82s2.57-5.82 5.72-5.82c1.8 0 3.01.77 3.7 1.43l2.53-2.46C17.09 3.88 14.97 2.8 12.5 2.8 6.98 2.8 2.5 7.28 2.5 12.8s4.48 10 10 10c5.74 0 9.5-4.02 9.5-9.7 0-.65-.07-1.27-.15-1.9z" />
      </svg>
    ),
    Friend: (
      <svg
        className="w-5 h-5 text-green-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    WhatsApp: (
      <svg
        className="w-5 h-5 text-green-600"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.377.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347z" />
      </svg>
    ),
    Facebook: (
      <svg
        className="w-5 h-5 text-blue-700"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.104C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" />
      </svg>
    ),
    "Social Media": (
      <svg
        className="w-5 h-5 text-purple-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">
          SM
        </text>
      </svg>
    ),
    Unknown: (
      <svg
        className="w-5 h-5 text-gray-400"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">
          ?
        </text>
      </svg>
    ),
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (filters.search) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((user) => user.status === filters.status);
    }

    if (filters.kycStatus && filters.kycStatus !== "all") {
      filtered = filtered.filter(
        (user) => user.kycStatus === filters.kycStatus,
      );
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

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

      if (response.ok) {
        // Update the user in the list
        setUsers(
          (prev) =>
            prev
              .map((user) => {
                if (user.id === id) {
                  if (action === "delete") {
                    return null; // Mark for removal
                  }
                  return {
                    ...user,
                    status: action === "suspend" ? "suspended" : "active",
                  };
                }
                return user;
              })
              .filter(Boolean) as User[],
        );
      }
    } catch (error) {
      console.error("Failed to process user action:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/update-role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        // Update the user's role in the list
        setUsers((prev) =>
          prev.map((user) => {
            if (user.id === userId) {
              return { ...user, role: newRole };
            }
            return user;
          }),
        );
      }
    } catch (error) {
      console.error("Failed to change user role:", error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Users Management
        </h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  // Aggregate referral sources
  const referralCounts: Record<string, number> = {};
  users.forEach((u) => {
    let referral = u.howYouHeardAboutUs || "Unknown";
    referral =
      typeof referral === "string" ? referral.trim().toLowerCase() : "Unknown";
    if (referral.includes("youtube")) referral = "YouTube";
    else if (referral.includes("google")) referral = "Google";
    else if (referral.includes("friend")) referral = "Friend";
    else if (referral.includes("whatsapp")) referral = "WhatsApp";
    else if (referral.includes("facebook")) referral = "Facebook";
    else if (referral.includes("social media")) referral = "Social Media";
    referralCounts[referral] = (referralCounts[referral] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Collapsible Referral Source Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-2">
        <button
          className={`w-full flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900 mb-4 focus:outline-none hover:text-blue-600 transition group cursor-pointer ${showReferralTable ? "bg-blue-50" : ""}`}
          onClick={() => setShowReferralTable((v) => !v)}
          aria-expanded={showReferralTable}
        >
          <span
            className={`transition-transform duration-300 ${showReferralTable ? "rotate-45" : ""}`}
          >
            <svg
              width="22"
              height="22"
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
          Referral Source Summary
          <span className="ml-auto text-xs font-normal text-blue-500 group-hover:underline">
            {showReferralTable ? "Hide" : "Show"}
          </span>
        </button>
        <div
          style={{
            maxHeight: showReferralTable ? "1000px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {showReferralTable && (
            <table className="w-full text-sm animate-fade-in">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 text-left font-semibold text-blue-700 rounded-tl-xl">
                    Source
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-blue-700 rounded-tr-xl">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(referralCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, count], idx) => (
                    <tr
                      key={source}
                      className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}
                    >
                      <td className="px-4 py-2 font-medium text-gray-800 flex items-center gap-2">
                        {referralIcons[source] || referralIcons.Unknown}
                        <span>{source}</span>
                      </td>
                      <td className="px-4 py-2 font-bold text-blue-600">
                        {count}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Users Management
        </h1>
        <div className="text-xs md:text-sm text-gray-600">
          {filteredUsers.length} of {users.length} users
        </div>
      </div>

      <UsersFilter filters={filters} onFiltersChange={setFilters} />
      <UsersTable
        users={filteredUsers}
        onAction={handleUserAction}
        onRoleChange={handleRoleChange}
      />
    </div>
  );
}
