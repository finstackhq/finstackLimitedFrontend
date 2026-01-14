"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"

type FormMode = "login" | "signup"

interface PasswordStrength {
  score: number
  label: string
  color: string
}

export function AuthForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [mode, setMode] = useState<FormMode>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [referralSource, setReferralSource] = useState("")

  // Validation errors
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [referralError, setReferralError] = useState("")

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0

    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    if (score <= 1) return { score: 1, label: "Poor", color: "bg-red-600" }
    if (score === 2) return { score: 2, label: "Weak", color: "bg-orange-500" }
    if (score === 3) return { score: 3, label: "Medium", color: "bg-yellow-500" }
    if (score === 4) return { score: 4, label: "Strong", color: "bg-blue-500" }
    return { score: 5, label: "Bulletproof", color: "bg-green-500" }
  }

  const passwordStrength = mode === "signup" ? calculatePasswordStrength(password) : null

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  // Password validation
  const validatePassword = (pwd: string): boolean => {
    if (!pwd) {
      setPasswordError("Password is required")
      return false
    }
    if (pwd.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return false
    }
    setPasswordError("")
    return true
  }

  // Confirm password validation
  const validateConfirmPassword = (confirmPwd: string): boolean => {
    if (!confirmPwd) {
      setConfirmPasswordError("Please confirm your password")
      return false
    }
    if (confirmPwd !== password) {
      setConfirmPasswordError("Passwords do not match")
      return false
    }
    setConfirmPasswordError("")
    return true
  }

  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setLoading(true)

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (mode === "signup") {
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)
      let isReferralValid = true
      if (!referralSource) {
        setReferralError("Please tell us how you heard about us")
        isReferralValid = false
      } else {
        setReferralError("")
      }

          if (isEmailValid && isPasswordValid && isConfirmPasswordValid && firstName && lastName && isReferralValid) {
            try {
              const res = await fetch("/api/fstack/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  firstName,
                  lastName,
                  email,
                  password,
                  howYouHeardAboutUs: referralSource,
                }),
              })
              const data = await res.json()
              console.log("[auth-form] register response status:", res.status)
              console.log("[auth-form] register response body:", data)
              if (res.ok) {
                // Persist email for verify page and redirect
                try {
                  localStorage.setItem("pendingVerifyEmail", email)
                } catch (e) {}
                toast({
                  title: "Check your email",
                  description:
                    "A verification link has been sent to your email. Please verify your account to continue.",
                  duration: 7000,
                })
                router.push(`/verify-email?email=${encodeURIComponent(email)}`)
              } else {
            setFormError(data?.error || "Registration failed")
          }
        } catch (err: any) {
          setFormError(err.message || "Registration failed")
        }
      }
    } else {
      if (isEmailValid && isPasswordValid) {
        try {
          const res = await fetch("/api/fstack/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })
          const data = await res.json()
          console.log("[auth-form] login response status:", res.status)
          console.log("[auth-form] login response body:", data)
          if (res.ok) {
            try {
              // Persist auth info for dashboard greeting and session
              if (data?.user?.accessToken) {
                localStorage.setItem("accessToken", data.user.accessToken)
              }
              if (data?.user?.firstName) {
                localStorage.setItem("userFirstName", data.user.firstName)
              }
              if (data?.user?.lastName) {
                localStorage.setItem("userLastName", data.user.lastName)
              }
              if (typeof data?.user?.kycVerified !== "undefined") {
                localStorage.setItem("isKycVerified", String(!!data.user.kycVerified))
              }
              if (data?.user?.kycStatus) {
                localStorage.setItem("kycStatus", String(data.user.kycStatus))
              }
              // Set merchant status based on role and kycVerified
              // User logic: must be role='merchant' AND kycVerified=true to be considered 'approved'
              // Otherwise, they see the application form
              if (data?.user?.role === 'merchant' && data?.user?.kycVerified === true) {
                localStorage.setItem("merchant-status", "approved")
              } else {
                localStorage.setItem("merchant-status", "not_applied")
              }
            } catch (e) {
              console.warn("[auth-form] failed to persist auth info:", e)
            }
            router.push("/dashboard")
          } else {
            setFormError(data?.message || data?.error || "Login failed")
          }
        } catch (err: any) {
          setFormError(err.message || "Login failed")
        }
      }
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-0 bg-card rounded-none sm:rounded-2xl overflow-hidden shadow-2xl">
        {/* Left side - Image (desktop) */}
<div className="hidden lg:block relative bg-linear-to-br from-primary/10 to-primary/5">
          <img
            src={mode === "login" ? "/login.png" : "/sign-up.png"}
            alt={mode === "login" ? "Login illustration" : "Signup illustration"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
<div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
        </div>

        {/* Right side - Form */}
        <div className="p-4 sm:p-8 lg:p-16 flex flex-col justify-center mt-0 sm:mt-0">
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${mode === "login" ? "text-foreground" : "text-muted-foreground"}`}>
              Login
            </span>
            <Switch
              checked={mode === "signup"}
              onCheckedChange={(checked) => {
                setMode(checked ? "signup" : "login")
                // Reset form and errors when switching
                setEmail("")
                setPassword("")
                setConfirmPassword("")
                setFirstName("")
                setLastName("")
                setReferralSource("")
                setEmailError("")
                setPasswordError("")
                setConfirmPasswordError("")
                setReferralError("")
              }}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${mode === "signup" ? "text-foreground" : "text-muted-foreground"}`}>
              Sign Up
            </span>
          </div>

          {/* Form Title */}
          <h2 className="text-3xl font-bold text-center mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            {mode === "login" ? "Enter your credentials to access your account" : "Fill in your details to get started"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="referralSource">How did you hear about us?</Label>
                <Input
                  id="referralSource"
                  type="text"
                  placeholder="e.g., Google, Friend, Social Media..."
                  value={referralSource}
                  onChange={(e) => {
                    setReferralSource(e.target.value)
                    if (referralError) setReferralError("")
                  }}
                  className={`h-12 ${referralError ? "border-destructive" : ""}`}
                />
                {referralError && <p className="text-sm text-destructive">{referralError}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) validateEmail(e.target.value)
                }}
                onBlur={() => validateEmail(email)}
                className={`h-12 pr-10 ${emailError ? "border-destructive" : ""}`}
                required
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) validatePassword(e.target.value)
                  }}
                  onBlur={() => validatePassword(password)}
                  className={`h-12 pr-10 ${passwordError ? "border-destructive" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}

              {mode === "signup" && password && passwordStrength && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Password Strength:</span>
                    <span
                      className={`font-medium ${
                        passwordStrength.label === "Poor"
                          ? "text-red-600"
                          : passwordStrength.label === "Weak"
                            ? "text-orange-500"
                            : passwordStrength.label === "Medium"
                              ? "text-yellow-500"
                              : passwordStrength.label === "Strong"
                                ? "text-blue-500"
                                : "text-green-500"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.score ? passwordStrength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (confirmPasswordError) validateConfirmPassword(e.target.value)
                    }}
                    onBlur={() => validateConfirmPassword(confirmPassword)}
                    className={`h-12 pr-10 ${confirmPasswordError ? "border-destructive" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPasswordError && <p className="text-sm text-destructive">{confirmPasswordError}</p>}
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-end">
                <a href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            {formError && <p className="text-sm text-destructive text-center">{formError}</p>}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (mode === "login" ? "Signing In..." : "Creating Account...") : (mode === "login" ? "Sign In" : "Create Account")}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
