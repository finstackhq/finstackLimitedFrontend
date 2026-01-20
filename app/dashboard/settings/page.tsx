"use client"

import { useState, useEffect } from "react"
import { Camera, Bell, CreditCard, User, Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddAccountDialog } from "@/components/dashboard/add-account-dialog"
import { KYCForm } from "@/components/dashboard/KYCForm"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Profile data
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    deposits: true,
    withdrawals: true,
    trades: true,
    marketing: false,
  })
  
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  
  // KYC verification status from profile API
  // Can be: false (not submitted), "pending" (under review), true (approved)
  const [kycVerified, setKycVerified] = useState<boolean | string | null>(null)

  // Fetch profile data
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/fstack/profile')
      const data = await res.json()

      if (data.success && data.data) {
        setProfile({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          email: data.data.email || "",
          phoneNumber: data.data.phoneNumber || "",
        })
        // Capture kycVerified from profile response
        // kycVerified can be: false (not submitted/rejected), "pending" (under review), true (approved)
        const verified = data.data.kycVerified
        setKycVerified(verified)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch('/api/fstack/profile?type=bank-accounts');
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
         const mappedMethods = data.data.map((acc: any, index: number) => ({
             id: acc._id || index + 1,
             bank: acc.bankName,
             accountNumber: acc.accountNumber,
             accountName: acc.accountName,
             primary: false // Backend might not tell us, default false or 1st logic ?
         }));
         setPaymentMethods(mappedMethods);
      }
    } catch (e) {
      console.error("Failed to fetch bank accounts", e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBankAccounts();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/fstack/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to update profile')
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully'
      })
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddPayment = async (account: { bankName: string; accountNumber: string; accountName: string }) => {
    try {
      const res = await fetch('/api/fstack/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountName: account.accountName
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to add bank account')
      }

      const newMethod = {
        id: paymentMethods.length + 1,
        bank: account.bankName,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        primary: paymentMethods.length === 0,
      }
      setPaymentMethods([...paymentMethods, newMethod])

      toast({
        title: 'Bank Account Added',
        description: 'Your bank account has been added successfully'
      })
    } catch (error: any) {
      console.error('Failed to add bank account:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to add bank account',
        variant: 'destructive'
      })
    }
  }

  const handleRemovePayment = (id: number) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  const handleSetPrimary = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        primary: method.id === id,
      })),
    )
  }

  const getInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1 md:mb-2">Settings</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        {/* Dynamic grid columns based on whether KYC tab is shown */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className={`grid w-full h-auto gap-1 md:gap-2 bg-transparent p-0 ${kycVerified === true ? 'grid-cols-3' : 'grid-cols-4'}`}>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 data-[state=active]:border-blue-600 text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5"
            >
              <User className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">Profile</span>
            </TabsTrigger>
            {/* Hide KYC tab for verified users (kycVerified === true) */}
            {kycVerified !== true && (
              <TabsTrigger
                value="kyc"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 data-[state=active]:border-blue-600 text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5 relative"
              >
                <Upload className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">KYC</span>
                {kycVerified === 'pending' && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    Pending
                  </span>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 data-[state=active]:border-blue-600 text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5"
            >
              <Bell className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 data-[state=active]:border-blue-600 text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5"
            >
              <CreditCard className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">Payment</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 border-gray-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Profile Information</h2>

              {/* Profile Photo */}
              <div className="mb-4 md:mb-6">
                <Label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">Profile Photo</Label>
                <div className="flex items-center gap-3 md:gap-4">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg md:text-xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 mb-2 bg-transparent text-xs md:text-sm"
                    >
                      <Camera className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="border-gray-200 text-sm md:text-base h-9 md:h-10"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="border-gray-200 text-sm md:text-base h-9 md:h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="border-gray-200 text-sm md:text-base h-9 md:h-10 bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phoneNumber || ""}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    className="border-gray-200 text-sm md:text-base h-9 md:h-10"
                  />
                </div>
              </div>

              <div className="mt-4 md:mt-6 flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm h-9 md:h-10"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc" className="space-y-4 md:space-y-6">
            {kycVerified === 'pending' ? (
              /* KYC Under Review - Pending State */
              <Card className="p-6 md:p-8 border-gray-200 shadow-sm">
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">KYC Under Review</h2>
                  <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto mb-6">
                    Your KYC application has been submitted and is currently being reviewed by our team. 
                    This process typically takes 1-3 business days.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> You will receive an email notification once your verification is complete.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              /* KYC Application Form - Not Submitted State (kycVerified === false) */
              <>
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">KYC Verification</h2>
                  <p className="text-xs md:text-sm text-gray-600">Complete all steps to verify your identity and unlock full platform features</p>
                </div>
                <KYCForm />
              </>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 border-gray-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Notification Preferences</h2>

              {/* Channels */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-3 md:mb-4">Notification Channels</h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm">Email Notifications</p>
                      <p className="text-xs md:text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm">SMS Notifications</p>
                      <p className="text-xs md:text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm">Push Notifications</p>
                      <p className="text-xs md:text-sm text-gray-600">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Activity Types */}
              <div>
                <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-3 md:mb-4">Activity Notifications</h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm">Deposits</p>
                      <p className="text-xs md:text-sm text-gray-600">Get notified when deposits are received</p>
                    </div>
                    <Switch
                      checked={notifications.deposits}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, deposits: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm">Withdrawals</p>
                      <p className="text-xs md:text-sm text-gray-600">Get notified about withdrawal status</p>
                    </div>
                    <Switch
                      checked={notifications.withdrawals}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, withdrawals: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm">P2P Trades</p>
                      <p className="text-xs md:text-sm text-gray-600">Get notified about P2P trade updates</p>
                    </div>
                    <Switch
                      checked={notifications.trades}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, trades: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm">Marketing & Updates</p>
                      <p className="text-xs md:text-sm text-gray-600">Receive news and promotional offers</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-6 flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm h-9 md:h-10">
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Payment Methods</h2>
                <AddAccountDialog onAccountAdded={handleAddPayment}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm h-9 md:h-10">
                    Add Bank Account
                  </Button>
                </AddAccountDialog>
              </div>

              <div className="space-y-3 md:space-y-4">
                {paymentMethods.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No payment methods added yet</p>
                ) : (
                  paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-xs md:text-sm">{method.bank}</p>
                            <p className="text-xs md:text-sm text-gray-600">{method.accountNumber}</p>
                            <p className="text-xs md:text-sm text-gray-600">{method.accountName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.primary ? (
                            <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Primary
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetPrimary(method.id)}
                              className="text-xs h-7 md:h-8"
                            >
                              Set Primary
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePayment(method.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}