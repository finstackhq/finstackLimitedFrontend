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

  return (
    <div className="space-y-6">
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
