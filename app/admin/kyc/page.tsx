"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { KYCRequestsTable } from '@/components/admin/KYCRequestsTable';
import { KYCOverview } from "@/components/admin/KYCOverview";

interface KYCRequest {
  id: string;
  name: string;
  legalName: string; // Full legal name as on ID
  email: string;
  country: string;
  documents: string[];
  frontIdImage?: string; // Front of ID document
  backIdImage?: string; // Back of ID document
  selfieImage?: string; // Selfie image if submitted
  submittedAt: string;
  status: string;
  phone?: string;
  address?: string;
  documentType?: string;
}

export default function KYCPage() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalRequests, setTotalRequests] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async (showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(currentPage),
          limit: String(limit),
        });
        if (statusFilter !== "all") {
          queryParams.set("status", statusFilter);
        }

        const response = await fetch(
          `/api/admin/kyc?${queryParams.toString()}`,
          {
            cache: "no-store",
          },
        );
        if (response.ok) {
          const data = await response.json();
          // Map backend records to UI shape with safe defaults
          const normalizeUrl = (s: any) => {
            if (!s || typeof s !== "string") return undefined;
            return s
              .trim()
              .replace(/^`+|`+$/g, "")
              .replace(/^"+|"+$/g, "")
              .replace(/^'+|'+$/g, "");
          };

          const records = Array.isArray(data)
            ? data
            : Array.isArray(data?.kycs)
              ? data.kycs
              : Array.isArray(data?.data)
                ? data.data
                : [];

          const mapped = records.map((r: any) => {
            const first = r?.firstname ?? r?.firstName ?? r?.user_id?.firstName;
            const last = r?.lastname ?? r?.lastName ?? r?.user_id?.lastName;
            const builtName = `${first || ""} ${last || ""}`.trim();
            return {
              id:
                r?.id ||
                r?._id ||
                r?.kycId ||
                r?.userId ||
                Math.random().toString(36).slice(2),
              name: r?.name || r?.fullName || r?.legalName || builtName || "—",
              legalName: r?.legalName || r?.fullName || builtName || "—",
              email: r?.email || r?.userEmail || r?.user_id?.email || "—",
              country: r?.country || r?.nationality || "—",
              documents:
                r?.documents || r?.documentUrls || r?.documentImages || [],
              documentType:
                r?.documentType || r?.idType || r?.id_type || "ID Document",

              submittedAt: r?.createdAt || r?.submittedAt || null,
              // submittedAt: r?.submittedAt || r?.createdAt || new Date().toISOString(),
              status: (r?.status || "pending").toLowerCase(),
              phone: r?.phone || r?.phoneNumber || r?.phone_number,
              address: r?.address,
              frontIdImage: normalizeUrl(
                r?.frontIdImage ||
                  r?.idFront ||
                  r?.frontId ||
                  r?.frontUrl ||
                  r?.proof_id?.front,
              ),
              backIdImage: normalizeUrl(
                r?.backIdImage ||
                  r?.idBack ||
                  r?.backId ||
                  r?.backUrl ||
                  r?.proof_id?.back,
              ),
              selfieImage: normalizeUrl(
                r?.selfieImage || r?.selfieUrl || r?.selfie,
              ),
              firstName: r?.firstName || r?.firstname || r?.user_id?.firstName,
              lastName: r?.lastName || r?.lastname || r?.user_id?.lastName,
              otherName: r?.otherName,
              gender: r?.gender,
              dateOfBirth: r?.dateOfBirth || r?.dob,
              nationality: r?.nationality || r?.country,
              countryOfResidence: r?.countryOfResidence,
              stateRegion: r?.stateRegion || r?.state,
              idType: r?.idType || r?.id_type,
              issuingCountry: r?.issuingCountry || r?.country,
              idNumber: r?.idNumber || r?.id_number,
            };
          });

          const resolvedTotalRequests = Number(
            data?.totalCount ??
              data?.totalRequests ??
              data?.pagination?.total ??
              mapped.length,
          );
          const resolvedTotalPages = Number(
            data?.totalPages ??
              data?.pagination?.totalPages ??
              Math.max(
                1,
                Math.ceil(resolvedTotalRequests / Math.max(1, limit)),
              ),
          );
          const resolvedCurrentPage = Number(
            data?.currentPage ??
              data?.page ??
              data?.pagination?.currentPage ??
              currentPage,
          );

          setRequests(mapped);
          setTotalRequests(resolvedTotalRequests);
          setTotalPages(resolvedTotalPages);

          // Sync page from backend only when value is valid to avoid render loops.
          if (
            Number.isFinite(resolvedCurrentPage) &&
            resolvedCurrentPage >= 1 &&
            resolvedCurrentPage <= Math.max(1, resolvedTotalPages) &&
            resolvedCurrentPage !== currentPage
          ) {
            setCurrentPage(resolvedCurrentPage);
          }
        } else {
          if (response.status === 401) {
            // Auto-logout: redirect to admin login
            router.push("/admin/login");
            return;
          }
          setRequests([]);
          setTotalRequests(0);
          setTotalPages(1);
        }
      } catch {
        setRequests([]);
        setTotalRequests(0);
        setTotalPages(1);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    fetchRequests(true);
  }, [currentPage, limit, statusFilter, router]);

  const approve = async (id: string) => {
    try {
      const response = await fetch("/api/admin/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "APPROVED" }),
      });
      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      } else if (response.status === 401) {
        router.push("/admin/login");
      }
    } catch {
      // noop
    }
  };
  // Updated the rejection part to work with reasons
  const reject = async (id: string, rejectionReason: string) => {
    if (!rejectionReason?.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      // const response = await fetch("/api/admin/kyc", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     id,
      //     status: "REJECTED",
      //     reason: rejectionReason,
      //   }),
      // });
      // FRONTEND PAGE.TSX
      const response = await fetch("/api/admin/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "REJECTED",
          rejectionReason: rejectionReason, // Changed from 'reason' to 'rejectionReason'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequests((prev) => prev.filter((r) => r.id !== data.data._id));
        alert("KYC rejected successfully.");
      } else if (response.status === 401) {
        router.push("/admin/login");
      } else {
        const errorData = await response.json();
        alert(`Failed to reject KYC: ${errorData.message || "Unknown error"}`);
      }
    } catch {
      alert("Failed to reject KYC due to network error.");
    }
  };

  const suspend = async (id: string, reason: string) => {
    try {
      const response = await fetch("/api/admin/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "SUSPENDED" }),
      });
      if (response.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "suspended" } : r)),
        );
      } else if (response.status === 401) {
        router.push("/admin/login");
      }
    } catch {
      // noop
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">KYC Requests</h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            KYC Requests
          </h1>
          <div className="text-xs md:text-sm text-gray-600 mt-1">
            Showing {requests.length} of {totalRequests} total requests
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                  All Status
                </span>
              </SelectItem>
              <SelectItem value="pending">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                  Pending
                </span>
              </SelectItem>
              <SelectItem value="approved">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Approved
                </span>
              </SelectItem>
              <SelectItem value="rejected">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Rejected
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <KYCOverview
        records={requests}
        onApprove={approve}
        onReject={reject}
        onSuspend={suspend}
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
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="px-3 py-1 rounded border bg-white disabled:opacity-30"
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
