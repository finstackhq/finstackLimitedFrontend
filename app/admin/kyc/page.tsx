'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { KYCRequestsTable } from '@/components/admin/KYCRequestsTable';
import { KYCOverview } from '@/components/admin/KYCOverview';

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
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/admin/kyc', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          // Map backend records to UI shape with safe defaults
          const normalizeUrl = (s: any) => {
            if (!s || typeof s !== 'string') return undefined;
            return s.trim().replace(/^`+|`+$/g, '').replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
          };

          const mapped = (Array.isArray(data) ? data : data?.kycs || data?.data || [])
            .map((r: any) => {
              const first = r?.firstname ?? r?.firstName ?? r?.user_id?.firstName;
              const last = r?.lastname ?? r?.lastName ?? r?.user_id?.lastName;
              const builtName = `${first || ''} ${last || ''}`.trim();
              return ({
                id: r?.id || r?._id || r?.kycId || r?.userId || Math.random().toString(36).slice(2),
                name: r?.name || r?.fullName || r?.legalName || builtName || '—',
                legalName: r?.legalName || r?.fullName || builtName || '—',
                email: r?.email || r?.userEmail || r?.user_id?.email || '—',
                country: r?.country || r?.nationality || '—',
                documents: r?.documents || r?.documentUrls || r?.documentImages || [],
                documentType: r?.documentType || r?.idType || r?.id_type || 'ID Document',
                submittedAt: r?.submittedAt || r?.createdAt || new Date().toISOString(),
                status: (r?.status || 'pending').toLowerCase(),
                phone: r?.phone || r?.phoneNumber || r?.phone_number,
                address: r?.address,
                frontIdImage: normalizeUrl(r?.frontIdImage || r?.idFront || r?.frontId || r?.frontUrl || r?.proof_id?.front),
                backIdImage: normalizeUrl(r?.backIdImage || r?.idBack || r?.backId || r?.backUrl || r?.proof_id?.back),
                selfieImage: normalizeUrl(r?.selfieImage || r?.selfieUrl || r?.selfie),
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
              })
            })
          setRequests(mapped)
        } else {
          if (response.status === 401) {
            // Auto-logout: redirect to admin login
            router.push('/admin/login')
            return
          }
          console.error('Failed to fetch KYC requests: status', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch KYC requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    // Optional: poll backend for updates every 15s
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const approve = async (id: string) => {
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' }),
      });
      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
      } else if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (e) {
      console.error('Approve failed', e);
    }
  };

  const reject = async (id: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'REJECTED', rejectionReason: reason }),
      });
      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
      } else if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (e) {
      console.error('Reject failed', e);
    }
  };

  const suspend = async (id: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'SUSPENDED' }),
      });
      if (response.ok) {
        setRequests(prev => prev.map(r => (r.id === id ? { ...r, status: 'suspended' } : r)));
      } else if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (e) {
      console.error('Suspend failed', e);
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
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">KYC Requests</h1>
        <div className="text-xs md:text-sm text-gray-600">
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </div>
      </div>
      <KYCOverview records={requests} onApprove={approve} onReject={reject} onSuspend={suspend} />
    </div>
  );
}