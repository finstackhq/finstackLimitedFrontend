'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Upload, Check, ArrowRight, ArrowLeft, User, MapPin, FileText, Clock, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { COUNTRIES } from '@/lib/countries';

interface KYCFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  otherName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  
  // Location Information
  nationality: string;
  countryOfResidence: string;
  stateRegion: string;
  city: string;
  address: string;
  
  // Identification
  idType: string;
  issuingCountry: string;
  idNumber: string;
  idExpiry: string;
  bvn: string;
  ninNumber: string;
  
  // Documents
  selfie: File | null;
  idFront: File | null;
  idBack: File | null;
}

const INITIAL_FORM_DATA: KYCFormData = {
  firstName: '',
  lastName: '',
  otherName: '',
  gender: '',
  dateOfBirth: '',
  phoneNumber: '',
  nationality: '',
  countryOfResidence: '',
  stateRegion: '',
  city: '',
  address: '',
  idType: '',
  issuingCountry: '',
  idNumber: '',
  idExpiry: '',
  bvn: '',
  ninNumber: '',
  selfie: null,
  idFront: null,
  idBack: null,
};

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const ID_TYPES = [
  'NIN',
  'National ID Card',
  'International Passport',
  "Driver's License",
  "Voter's Card",
  'Others'
];

export function KYCForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>(INITIAL_FORM_DATA);
  const [selfiePreview, setSelfiePreview] = useState<string>('');
  const [idFrontPreview, setIdFrontPreview] = useState<string>('');
  const [idBackPreview, setIdBackPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<{
    status: 'none' | 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    submittedAt?: string;
  }>({ status: 'none' });

  // Liveliness session & results
  const [kycSessionId, setKycSessionId] = useState<string>('');
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [selfieCloudUrl, setSelfieCloudUrl] = useState<string>('');
  const [livelinessProviderReference, setLivelinessProviderReference] = useState<string>('');
  const [livelinessConfidence, setLivelinessConfidence] = useState<number | null>(null);
  const [startingSession, setStartingSession] = useState<boolean>(false);
  const [uploadingSelfie, setUploadingSelfie] = useState<boolean>(false);
  const [checkingLiveliness, setCheckingLiveliness] = useState<boolean>(false);

  // No localStorage: status is managed in-session; backend enforces duplicates

  const updateField = (field: keyof KYCFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelfiePreview(reader.result as string);
      updateField('selfie', file);
    };
    reader.readAsDataURL(file);
  };

  const handleIdFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Upload an image', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdFrontPreview(reader.result as string);
      updateField('idFront', file);
    };
    reader.readAsDataURL(file);
  };

  const handleIdBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Upload an image', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdBackPreview(reader.result as string);
      updateField('idBack', file);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Step 1: Liveliness session must be started
        if (!kycSessionId || !sessionExpiresAt) {
          toast({ title: 'Start Liveliness', description: 'Create a KYC session first', variant: 'destructive' });
          return false;
        }
        return true;

      case 2:
        // Step 2: Selfie file selected
        if (!formData.selfie) {
          toast({ title: 'Selfie Required', description: 'Select a selfie image to proceed', variant: 'destructive' });
          return false;
        }
        return true;

      case 3:
        // Step 3: Liveliness must be checked with sufficient confidence
        if (!livelinessProviderReference || (livelinessConfidence ?? 0) < 60) {
          toast({ title: 'Liveliness Not Verified', description: 'Please complete liveness check (≥60%)', variant: 'destructive' });
          return false;
        }
        return true;

      case 4:
        // Personal Information validation
        if (!formData.firstName || !formData.lastName || !formData.gender || 
            !formData.dateOfBirth || !formData.phoneNumber) {
          toast({
            title: 'Incomplete Information',
            description: 'Please fill in all required personal information fields',
            variant: 'destructive'
          });
          return false;
        }
        return true;

      case 5:
        // Location Information validation
        if (!formData.nationality || !formData.countryOfResidence || 
            !formData.stateRegion || !formData.address) {
          toast({
            title: 'Incomplete Information',
            description: 'Please fill in all required location information fields',
            variant: 'destructive'
          });
          return false;
        }
        return true;

      case 6:
        // Identification validation
        const isNigerian = (formData.nationality || '').toLowerCase() === 'nigeria' || (formData.countryOfResidence || '').toLowerCase() === 'nigeria';
        if (!formData.idType || !formData.issuingCountry || !formData.idNumber) {
          toast({ title: 'Incomplete Information', description: 'Fill ID type, issuing country, and ID number', variant: 'destructive' });
          return false;
        }
        if (isNigerian) {
          if (!formData.bvn || !formData.ninNumber) {
            toast({ title: 'BVN and NIN required', description: 'Provide BVN and NIN for Nigerian verification', variant: 'destructive' });
            return false;
          }
        } else {
          if (!formData.idExpiry) {
            toast({ title: 'ID Expiry required', description: 'Provide ID expiry date for non-Nigerian verification', variant: 'destructive' });
            return false;
          }
          if (!formData.idFront || !formData.idBack || !formData.selfie) {
            toast({ title: 'Documents required', description: 'Upload ID front, ID back, and selfie for non-Nigerian verification', variant: 'destructive' });
            return false;
          }
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setSubmitting(true);
    try {
      const isNigerian = (formData.nationality || '').toLowerCase() === 'nigeria' || (formData.countryOfResidence || '').toLowerCase() === 'nigeria';

      if (isNigerian) {
        // Build multipart form-data for backend (Nigerian flow)
        const form = new FormData();
        form.append('firstname', formData.firstName);
        form.append('lastname', formData.lastName);
        form.append('gender', (formData.gender || '').toUpperCase());
        form.append('dob', formData.dateOfBirth);
        form.append('phone_number', formData.phoneNumber);
        form.append('address', formData.address);
        form.append('state', formData.stateRegion);
        form.append('city', formData.city);
        // Prefer country of residence, fallback to nationality
        form.append('country', formData.countryOfResidence || formData.nationality);
        form.append('bvn', formData.bvn);
        form.append('nin_number', formData.ninNumber);
        form.append('id_type', formData.idType);
        form.append('id_number', formData.idNumber);
        if (formData.selfie) {
          form.append('selfie', formData.selfie);
        }

        // Include liveliness fields
        let refToSend = livelinessProviderReference
        let confToSend = livelinessConfidence
        if (!refToSend || typeof confToSend !== 'number') {
          try {
            const raw = localStorage.getItem('kyc_liveness')
            if (raw) {
              const parsed = JSON.parse(raw)
              const candidateRef = parsed?.provider_reference ?? parsed?.liveliness_provider_reference ?? parsed?.providerReference
              if (!refToSend && candidateRef) refToSend = String(candidateRef)
              const candidateConf = parsed?.confidence ?? parsed?.liveliness_confidence
              const numConf = typeof candidateConf === 'number' ? candidateConf : Number(candidateConf)
              if (typeof confToSend !== 'number' && !Number.isNaN(numConf)) confToSend = numConf
            }
          } catch {}
        }
        if (refToSend) form.append('liveliness_provider_reference', String(refToSend))
        if (typeof confToSend === 'number') form.append('liveliness_confidence', String(confToSend))

        const res = await fetch('/api/fstack/userkyc', {
          method: 'POST',
          body: form,
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await res.json().catch(() => ({ message: 'No JSON body' }));
        if (!res.ok) {
          throw new Error((data as any)?.message || 'Submission failed');
        }
      } else {
        // Non-Nigerian: send files directly to backend as multipart (no Cloudinary for KYC submit)
        // Normalize id_type tokens to backend expected values
        const idTypeRaw = (formData.idType || '').toLowerCase()
        const idTypeNormalized = idTypeRaw.includes('passport')
          ? 'PASSPORT'
          : idTypeRaw.includes('national') && idTypeRaw.includes('id')
            ? 'NATIONAL_ID'
            : idTypeRaw.includes('driver')
              ? 'DRIVERS_LICENSE'
              : idTypeRaw.includes('voter')
                ? 'VOTERS_CARD'
                : idTypeRaw.includes('nin')
                  ? 'NIN'
                  : (formData.idType || '').toUpperCase()

        const form = new FormData()
        form.append('firstname', String(formData.firstName || ''))
        form.append('lastname', String(formData.lastName || ''))
        form.append('gender', String((formData.gender || '').toUpperCase()))
        form.append('dob', String(formData.dateOfBirth || ''))
        form.append('phone_number', String(formData.phoneNumber || ''))
        form.append('address', String(formData.address || ''))
        form.append('state', String(formData.stateRegion || ''))
        form.append('city', String(formData.city || ''))
        form.append('country', String(formData.countryOfResidence || formData.nationality || ''))
        form.append('id_type', String(idTypeNormalized || ''))
        form.append('id_number', String(formData.idNumber || ''))
        if (formData.idExpiry) form.append('id_expiry', String(formData.idExpiry))

        // Append files directly
        if (formData.selfie) form.append('selfie', formData.selfie, (formData.selfie as any).name || 'selfie.jpg')
        // Send non-Nigerian ID images using backend-accepted flat keys
        if (formData.idFront) form.append('proof_id_front', formData.idFront, (formData.idFront as any).name || 'id_front.jpg')
        if (formData.idBack) form.append('proof_id_back', formData.idBack, (formData.idBack as any).name || 'id_back.jpg')

        // Include liveliness fields (unchanged behavior)
        let refToSend = livelinessProviderReference
        let confToSend = livelinessConfidence
        try {
          const raw = localStorage.getItem('kyc_liveness')
          if (raw) {
            const parsed = JSON.parse(raw)
            const candidateRef = parsed?.provider_reference ?? parsed?.liveliness_provider_reference ?? parsed?.providerReference
            if (!refToSend && candidateRef) refToSend = String(candidateRef)
            const candidateConf = parsed?.confidence ?? parsed?.liveliness_confidence
            const numConf = typeof candidateConf === 'number' ? candidateConf : Number(candidateConf)
            if (typeof confToSend !== 'number' && !Number.isNaN(numConf)) confToSend = numConf
          }
        } catch {}
        if (refToSend) form.append('liveliness_provider_reference', String(refToSend))
        if (typeof confToSend === 'number') form.append('liveliness_confidence', String(confToSend))

        const res = await fetch('/api/fstack/userkyc', {
          method: 'POST',
          body: form,
          cache: 'no-store',
          credentials: 'include',
        })

        const data = await res.json().catch(() => ({ message: 'No JSON body' }))
        if (!res.ok) {
          throw new Error((data as any)?.message || 'Submission failed')
        }
      }

      // Mark pending in UI; enforce single submission in-session
      setKycStatus({ status: 'pending', submittedAt: new Date().toISOString() });
      toast({
        title: 'KYC Submitted Successfully',
        description: 'Your application is under review. You will be notified once processed.',
      });

      // Reset form
      setFormData(INITIAL_FORM_DATA);
      setSelfiePreview('');
      setCurrentStep(1);
      setKycSessionId('');
      setSessionExpiresAt(null);
      setCountdown(0);
      setSelfieCloudUrl('');
      setLivelinessProviderReference('');
      setLivelinessConfidence(null);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Countdown for live session expiry
  useEffect(() => {
    if (!sessionExpiresAt) return;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((sessionExpiresAt - now) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setKycSessionId('');
        setSessionExpiresAt(null);
        setCurrentStep(1);
        setFormData(prev => ({ ...prev, selfie: null }));
        setSelfiePreview('');
        setSelfieCloudUrl('');
        setLivelinessProviderReference('');
        setLivelinessConfidence(null);
        toast({ title: 'Session Expired', description: 'Start a new liveness session', variant: 'destructive' })
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionExpiresAt]);

  const startLivelinessSession = async () => {
    try {
      setStartingSession(true);
      const res = await fetch('/api/fstack/kycSession', { method: 'POST', cache: 'no-store', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any)?.message || 'Failed to start session')
      const sessionId = (data as any)?.kyc_session_id || (data as any)?.sessionId
      const expiresAt = (data as any)?.expiresAt ? new Date((data as any)?.expiresAt).getTime() : Date.now() + 5 * 60 * 1000
      if (!sessionId) throw new Error('kyc_session_id missing')
      setKycSessionId(sessionId)
      setSessionExpiresAt(expiresAt)
      toast({ title: 'Liveliness Session Started', description: 'Session active for 5 minutes' })
      setCurrentStep(2)
    } catch (e: any) {
      toast({ title: 'Failed to start session', description: e?.message || 'Please try again', variant: 'destructive' })
    } finally {
      setStartingSession(false)
    }
  }

  const uploadSelfieToCloudinary = async (): Promise<string> => {
    if (!formData.selfie) throw new Error('No selfie selected')
    setUploadingSelfie(true)
    try {
      const fd = new FormData()
      fd.append('file', formData.selfie)
      const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any)?.error || 'Cloudinary upload failed')
      const url = (data as any)?.secure_url || (data as any)?.url
      if (!url) throw new Error('Upload succeeded but no URL returned')
      setSelfieCloudUrl(url)
      return url
    } finally {
      setUploadingSelfie(false)
    }
  }

  const runLivelinessCheck = async () => {
    try {
      setCheckingLiveliness(true)
      const url = selfieCloudUrl || (await uploadSelfieToCloudinary())
      const res = await fetch('/api/fstack/kycLiveliness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_session_id: kycSessionId, selfie_url: url }),
        cache: 'no-store',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      console.log('[kycLiveliness] response:', data)
      if (!res.ok) throw new Error((data as any)?.message || 'Liveliness failed')
      const ref = (data as any)?.liveliness_provider_reference ?? (data as any)?.provider_reference ?? (data as any)?.providerReference
      const conf = Number((data as any)?.liveliness_confidence ?? (data as any)?.confidence ?? 0)
      setLivelinessProviderReference(String(ref || ''))
      setLivelinessConfidence(conf)
      // Persist liveness result locally and cancel timer once complete
      try {
        const payload = {
          provider_reference: String(ref || ''),
          confidence: conf,
          verified: Boolean((data as any)?.verified ?? true),
          detail: (data as any)?.detail ?? null,
        }
        localStorage.setItem('kyc_liveness', JSON.stringify(payload))
      } catch {}
      setSessionExpiresAt(null)
      setCountdown(0)
      if (conf < 60) {
        toast({ title: 'Low Confidence', description: 'Please retake your selfie (confidence < 60%)', variant: 'destructive' })
      } else {
        toast({ title: 'Liveliness Verified', description: `Confidence ${conf}%` })
        setCurrentStep(4)
      }
    } catch (e: any) {
      toast({ title: 'Liveliness Error', description: e?.message || 'Please try again', variant: 'destructive' })
    } finally {
      setCheckingLiveliness(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-center max-w-2xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`
              flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm
              ${currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'}
           `}>
              {currentStep > step ? <Check className="w-5 h-5" /> : step}
            </div>
            {step < 6 && (
              <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-6 md:p-8 border-gray-200 shadow-sm">
      {/* KYC Approved Status */}
      {kycStatus.status === 'approved' && (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">KYC Approved!</h3>
            <p className="text-gray-600">
              Your identity has been verified successfully. You now have full access to all platform features.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-green-800">
              <strong>Status:</strong> Verified ✓
            </p>
          </div>
        </div>
      )}

      {/* KYC Pending Status */}
      {kycStatus.status === 'pending' && (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">KYC Under Review</h3>
            <p className="text-gray-600 mb-4">
              Your verification documents have been submitted and are currently being reviewed by our team.
            </p>
            <p className="text-sm text-gray-500">
              Submitted on: {kycStatus.submittedAt ? new Date(kycStatus.submittedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Status:</strong> Pending Review
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              This usually takes 24-48 hours. You'll be notified once the review is complete.
            </p>
          </div>
        </div>
      )}

      {/* KYC Rejected - Show reason and allow resubmission */}
      {kycStatus.status === 'rejected' && (
        <>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-900 mb-1">KYC Application Rejected</h4>
                <p className="text-sm text-red-800 mb-2">
                  Unfortunately, your KYC application was not approved. Please review the reason below and resubmit with the correct information.
                </p>
                <div className="bg-white border border-red-300 rounded p-3 mt-3">
                  <p className="text-xs font-semibold text-red-900 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-800">{kycStatus.rejectionReason || 'No reason provided'}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Show form for resubmission */}
        </>
      )}

      {/* Show form only if not approved or pending */}
      {(kycStatus.status === 'none' || kycStatus.status === 'rejected') && (
        <>
          {renderStepIndicator()}

      {/* Step 1: Liveness Session */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
            <Camera className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Liveness Check: Start Session</h3>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Start a KYC liveliness session. This creates a temporary session and enables selfie verification.</p>
            <div className="flex items-center gap-4">
              <Button onClick={startLivelinessSession} disabled={startingSession} className="bg-blue-600 hover:bg-blue-700 text-white">
                {startingSession ? 'Starting...' : 'Start Liveness Check'}
              </Button>
              {kycSessionId && (
                <div className="text-xs text-gray-600">
                  Session ID: <span className="font-mono">{kycSessionId.slice(0, 12)}…</span>
                </div>
              )}
            </div>
            {sessionExpiresAt && (
              <p className="text-xs text-gray-500">Session expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select Selfie */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="mb-6 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">Select Selfie</h3>
            </div>
            <p className="text-sm text-gray-600 pl-8">Choose a clear selfie image. You will upload it in the next step.</p>
            {sessionExpiresAt && (
              <p className="text-xs text-gray-500 pl-8">Session expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Selfie <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleSelfieChange}
                className="hidden"
                id="selfieSelect"
              />
              <label
                htmlFor="selfieSelect"
                className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors cursor-pointer"
              >
                {selfiePreview ? (
                  <div className="relative">
                    <img 
                      src={selfiePreview} 
                      alt="Selfie" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to select</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Upload & Liveliness */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
            <Camera className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Upload & Run Liveliness</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">we would check your seldie and verify liveness</p>
            <div className="flex items-center gap-4">
              <Button onClick={runLivelinessCheck} disabled={checkingLiveliness || !formData.selfie || !kycSessionId} className="bg-purple-600 hover:bg-purple-700 text-white">
                {checkingLiveliness ? 'Checking...' : 'Upload & Verify'}
              </Button>
              {selfieCloudUrl && <span className="text-xs text-gray-600">Uploaded ✓</span>}
            </div>
            {typeof livelinessConfidence === 'number' && (
              <div className={`text-sm ${livelinessConfidence < 60 ? 'text-red-600' : 'text-green-600'}`}>
                Confidence: {livelinessConfidence}% {livelinessProviderReference && `• Ref: ${livelinessProviderReference.slice(0, 12)}…`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Personal Information */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="mb-6 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="Enter your first name"
                className="border-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Enter your last name"
                className="border-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="otherName" className="text-sm font-medium mb-2 block">
                Other Name
              </Label>
              <Input
                id="otherName"
                value={formData.otherName}
                onChange={(e) => updateField('otherName', e.target.value)}
                placeholder="Enter other name (optional)"
                className="border-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="gender" className="text-sm font-medium mb-2 block">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.gender} onValueChange={(val) => updateField('gender', val)}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="text-sm font-medium mb-2 block">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className="border-gray-200"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-medium mb-2 block">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                placeholder="+234 801 234 5678"
                className="border-gray-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Location Information */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
            <MapPin className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Location Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nationality" className="text-sm font-medium mb-2 block">
                Nationality <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.nationality} onValueChange={(val) => updateField('nationality', val)}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="countryOfResidence" className="text-sm font-medium mb-2 block">
                Country of Residence <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.countryOfResidence} 
                onValueChange={(val) => updateField('countryOfResidence', val)}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stateRegion" className="text-sm font-medium mb-2 block">
                State/Region <span className="text-red-500">*</span>
              </Label>
              {formData.countryOfResidence === 'Nigeria' ? (
                <Select value={formData.stateRegion} onValueChange={(val) => updateField('stateRegion', val)}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="stateRegion"
                  value={formData.stateRegion}
                  onChange={(e) => updateField('stateRegion', e.target.value)}
                  placeholder="Enter your state/region"
                  className="border-gray-200"
                />
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-sm font-medium mb-2 block">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Enter your full address"
                className="border-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="city" className="text-sm font-medium mb-2 block">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Enter your city"
                className="border-gray-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Identification */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
            <FileText className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Identification</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="idType" className="text-sm font-medium mb-2 block">
                ID Type <span className="text-red-500">*</span>
              </Label>
              {/* Remove NIN option for non-Nigerian */}
              <Select value={formData.idType} onValueChange={(val) => updateField('idType', val)}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  {( ((formData.nationality || '').toLowerCase() === 'nigeria' || (formData.countryOfResidence || '').toLowerCase() === 'nigeria')
                    ? ID_TYPES
                    : ID_TYPES.filter(t => t !== 'NIN')
                  ).map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issuingCountry" className="text-sm font-medium mb-2 block">
                Issuing Country <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.issuingCountry} 
                onValueChange={(val) => updateField('issuingCountry', val)}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="idNumber" className="text-sm font-medium mb-2 block">
                ID Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => updateField('idNumber', e.target.value)}
                placeholder="Enter your ID number"
                className="border-gray-200"
              />
            </div>

            {((formData.nationality || '').toLowerCase() !== 'nigeria' && (formData.countryOfResidence || '').toLowerCase() !== 'nigeria') && (
              <div>
                <Label htmlFor="idExpiry" className="text-sm font-medium mb-2 block">
                  ID Expiry <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="idExpiry"
                  type="date"
                  value={formData.idExpiry}
                  onChange={(e) => updateField('idExpiry', e.target.value)}
                  className="border-gray-200"
                />
              </div>
            )}

            {( (formData.nationality || '').toLowerCase() === 'nigeria' || (formData.countryOfResidence || '').toLowerCase() === 'nigeria') ? (
              <>
                <div>
                  <Label htmlFor="bvn" className="text-sm font-medium mb-2 block">
                    BVN <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bvn"
                    value={formData.bvn}
                    onChange={(e) => updateField('bvn', e.target.value)}
                    placeholder="Enter your BVN"
                    className="border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="ninNumber" className="text-sm font-medium mb-2 block">
                    NIN Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ninNumber"
                    value={formData.ninNumber}
                    onChange={(e) => updateField('ninNumber', e.target.value)}
                    placeholder="Enter your NIN"
                    className="border-gray-200"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Non-Nigerian: require ID front/back uploads */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">ID Front <span className="text-red-500">*</span></Label>
                  <input type="file" accept="image/*" onChange={handleIdFrontChange} className="hidden" id="idFrontSelect" />
                  <label htmlFor="idFrontSelect" className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors cursor-pointer">
                    {idFrontPreview ? (
                      <img src={idFrontPreview} alt="ID Front" className="w-full h-48 object-cover rounded-lg" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to select front of ID</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">ID Back <span className="text-red-500">*</span></Label>
                  <input type="file" accept="image/*" onChange={handleIdBackChange} className="hidden" id="idBackSelect" />
                  <label htmlFor="idBackSelect" className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors cursor-pointer">
                    {idBackPreview ? (
                      <img src={idBackPreview} alt="ID Back" className="w-full h-48 object-cover rounded-lg" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to select back of ID</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
                {/* Non-Nigerian: add selfie upload for KYC submission (sent directly to backend) */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium mb-2 block">Upload Selfie <span className="text-red-500">*</span></Label>
                  <input type="file" accept="image/*" onChange={handleSelfieChange} className="hidden" id="selfieKycSelect" />
                  <label htmlFor="selfieKycSelect" className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors cursor-pointer">
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="Selfie" className="w-full h-48 object-cover rounded-lg" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload a selfie</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || submitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < 6 ? (
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Submit KYC'}
            <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
        </>
      )}
    </Card>
  );
}
