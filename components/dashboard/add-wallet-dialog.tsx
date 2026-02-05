"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddWalletDialogProps {
  children: React.ReactNode;
  onWalletAdded?: (wallet: {
    name: string;
    address: string;
    network: string;
    asset: string;
  }) => void;
}

const assetTypes = [
  { value: "USDC", label: "USDC" },
  { value: "CNGN", label: "CNGN" },
  { value: "USDT", label: "USDT" },
];

const networks = [
  { value: "Base", label: "Base", description: "Base (supported)" },
  {
    value: "BSC",
    label: "BSC (Binance Smart Chain)",
    description: "Coming soon",
    disabled: true,
  },
  {
    value: "Ethereum",
    label: "Ethereum",
    description: "Coming soon",
    disabled: true,
  },
  { value: "Tron", label: "Tron", description: "Coming soon", disabled: true },
];

export function AddWalletDialog({
  children,
  onWalletAdded,
}: AddWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const { toast } = useToast();

  const isValidAddress = (address: string) => {
    // Basic validation for crypto addresses
    if (!address) return false;
    // For Base, BSC, Ethereum, Tron, just check length and alphanumeric
    return address.length >= 26 && address.length <= 62;
  };

  const handleAddWallet = async () => {
    if (
      walletName &&
      walletAddress &&
      selectedNetwork &&
      selectedAsset &&
      isValidAddress(walletAddress)
    ) {
      try {
        const res = await fetch("/api/fstack/withdrawal-wallets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if needed, e.g. 'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: walletName,
            address: walletAddress,
            network: selectedNetwork,
            asset: selectedAsset,
          }),
        });
        const data = await res.json();
        if (res.ok && data.wallet) {
          toast({
            title: "Wallet Added",
            description: `${walletName} wallet has been added successfully.`,
          });
          onWalletAdded?.(data.wallet);
          // Reset form
          setWalletName("");
          setWalletAddress("");
          setSelectedNetwork("");
          setSelectedAsset("");
          setOpen(false);
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to add wallet.",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Network error. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const canSubmit =
    walletName &&
    walletAddress &&
    selectedNetwork &&
    selectedAsset &&
    isValidAddress(walletAddress);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Add Wallet Address
          </DialogTitle>
          <DialogDescription>
            Add a new USDT wallet address for withdrawals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Wallet Name</Label>
            <Input
              id="wallet-name"
              placeholder="e.g., My Binance Wallet"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-type">Asset Type</Label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((asset) => (
                  <SelectItem key={asset.value} value={asset.value}>
                    {asset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem
                    key={network.value}
                    value={network.value}
                    disabled={network.disabled}
                  >
                    <div>
                      <div className="font-medium">{network.label}</div>
                      <div className="text-xs text-gray-500">
                        {network.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-blue-700 mt-1">
              Only Base withdrawals are currently supported. Other networks
              coming soon.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <div className="relative">
              <Input
                id="wallet-address"
                placeholder="Enter wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className={`pr-10 ${
                  walletAddress && !isValidAddress(walletAddress)
                    ? "border-red-300 focus:border-red-500"
                    : walletAddress && isValidAddress(walletAddress)
                      ? "border-green-300 focus:border-green-500"
                      : ""
                }`}
              />
              {walletAddress && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidAddress(walletAddress) ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {walletAddress && !isValidAddress(walletAddress) && (
              <p className="text-xs text-red-600">
                Please enter a valid wallet address
              </p>
            )}
          </div>

          {selectedNetwork && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>Important:</strong> Make sure this address supports the
                selected asset on the {selectedNetwork} network. Sending to an
                incorrect address may result in permanent loss of funds.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddWallet}
            disabled={!canSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
