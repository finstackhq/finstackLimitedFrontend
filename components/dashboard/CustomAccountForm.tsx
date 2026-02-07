"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Loader2, Upload, X, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomAccountFormProps {
  onAccountAdded?: (account: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    alipayQrFile?: File;
    alipayAccountName?: string;
    alipayEmail?: string;
  }) => void;
}

export function CustomAccountForm({ onAccountAdded }: CustomAccountFormProps) {
  const [walletName, setWalletName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [alipayQrFile, setAlipayQrFile] = useState<File | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [alipayAccountName, setAlipayAccountName] = useState("");
  const [alipayEmail, setAlipayEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Updated validation
  const isBankValid =
    walletName.trim().length >= 2 &&
    accountNumber.trim().length >= 5 &&
    accountName.trim().length >= 2;

  const isAlipayValid =
    alipayQrFile !== null ||
    alipayAccountName.trim().length > 0 ||
    alipayEmail.trim().length > 0;

  const isValid = isBankValid || isAlipayValid;
  // const isValid =
  //   walletName.trim().length >= 2 &&
  //   accountNumber.trim().length >= 5 &&
  //   accountName.trim().length >= 2;

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setAlipayQrFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setQrCodeImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeQrCode = () => {
    setQrCodeImage(null);
    setAlipayQrFile(null);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!isValid) return;

  //   setIsSubmitting(true);
  //   try {
  //     // Prepare form data for Alipay QR upload
  //     if (alipayQrFile) {
  //       const formData = new FormData();
  //       formData.append("alipay_qr", alipayQrFile);
  //       formData.append("alipayAccountName", alipayAccountName.trim());
  //       formData.append("alipayEmail", alipayEmail.trim());

  //       // Get token from localStorage
  //       const storedUser = localStorage.getItem("user");
  //       let token = "";
  //       if (storedUser) {
  //         const userData = JSON.parse(storedUser);
  //         token = userData.accessToken || userData.user?.accessToken || "";
  //       }

  //       const res = await fetch("https://finstacklimitedbackend.onrender.com/api/upload-alipay-qr", {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: formData,
  //       });
  //       const data = await res.json();
  //       if (!res.ok || !data.success) {
  //         throw new Error(data.message || "Failed to upload Alipay QR");
  //       }
  //       toast({
  //         title: "Alipay QR Uploaded",
  //         description: "Your Alipay QR and details have been uploaded.",
  //       });
  //     }

  //     await onAccountAdded?.({
  //       bankName: walletName.trim(),
  //       accountNumber: accountNumber.trim(),
  //       accountName: accountName.trim(),
  //       alipayQrFile: alipayQrFile || undefined,
  //       alipayAccountName: alipayAccountName.trim() || undefined,
  //       alipayEmail: alipayEmail.trim() || undefined,
  //     });

  //     // Reset form
  //     setWalletName("");
  //     setAccountNumber("");
  //     setAccountName("");
  //     setQrCodeImage(null);
  //     setAlipayQrFile(null);
  //     setAlipayAccountName("");
  //     setAlipayEmail("");

  //     toast({
  //       title: "Account Added",
  //       description: "Your custom account has been added successfully.",
  //     });
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to add account",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return; // Now uses the new flexible validation

    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem("user");
      let token = "";
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.accessToken || userData.user?.accessToken || "";
      }

      // 1. Handle Alipay Upload (User Model)
      if (isAlipayValid) {
        const formData = new FormData();
        if (alipayQrFile) formData.append("alipay_qr", alipayQrFile);
        formData.append("alipayAccountName", alipayAccountName.trim());
        formData.append("alipayEmail", alipayEmail.trim());

        const alipayRes = await fetch(
          "https://finstacklimitedbackend.onrender.com/api/upload-alipay-qr",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );

        const alipayData = await alipayRes.json();
        if (!alipayRes.ok || !alipayData.success) {
          throw new Error(alipayData.message || "Alipay upload failed");
        }
      }

      // 2. Handle Bank Account (UserBankAccount Model)
      if (isBankValid) {
        // If your parent component handles the API call via onAccountAdded:
        await onAccountAdded?.({
          bankName: walletName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
        });
      }

      toast({
        title: "Success",
        description: "Details updated successfully.",
      });

      // Reset all fields
      setWalletName("");
      setAccountNumber("");
      setAccountName("");
      setQrCodeImage(null);
      setAlipayQrFile(null);
      setAlipayAccountName("");
      setAlipayEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="walletName"
          className="text-xs md:text-sm font-medium text-gray-700"
        >
          Bank / Momo / Wallet Name
        </Label>
        <div className="relative">
          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="walletName"
            placeholder="e.g. MTN Mobile Money, M-Pesa, Wise, Alipay"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            className="pl-10 border-gray-200 text-sm h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="customAccountNumber"
          className="text-xs md:text-sm font-medium text-gray-700"
        >
          Account Number / Phone Number
        </Label>
        <Input
          id="customAccountNumber"
          placeholder="Enter account or phone number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="border-gray-200 text-sm h-10"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="customAccountName"
          className="text-xs md:text-sm font-medium text-gray-700"
        >
          Account Name
        </Label>
        <Input
          id="customAccountName"
          placeholder="Name on the account"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="border-gray-200 text-sm h-10"
        />
      </div>

      {/* QR Code Upload - Optional */}
      {/* Alipay QR Upload Section */}
      <div className="space-y-2">
        <Label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Alipay QR Code (Optional)
        </Label>
        <p className="text-xs text-gray-500">
          Upload your Alipay QR code and details
        </p>

        {qrCodeImage ? (
          <div className="relative border rounded-lg p-4 bg-gray-50">
            <img
              src={qrCodeImage}
              alt="QR Code Preview"
              className="max-w-[200px] h-auto mx-auto rounded"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeQrCode}
              className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
            <Upload className="h-6 w-6 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">
              Click to upload QR code
            </span>
            <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleQrCodeUpload}
            />
          </label>
        )}
        {/* Alipay Account Name */}
        <Input
          id="alipayAccountName"
          placeholder="Alipay Account Name"
          value={alipayAccountName}
          onChange={(e) => setAlipayAccountName(e.target.value)}
          className="border-gray-200 text-sm h-10 mt-2"
        />
        {/* Alipay Email */}
        <Input
          id="alipayEmail"
          placeholder="Alipay Email"
          value={alipayEmail}
          onChange={(e) => setAlipayEmail(e.target.value)}
          className="border-gray-200 text-sm h-10 mt-2"
        />
      </div>

      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Custom Account"
        )}
      </Button>
    </form>
  );
}
