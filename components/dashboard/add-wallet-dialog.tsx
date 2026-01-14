"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Wallet, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddWalletDialogProps {
  children: React.ReactNode
  onWalletAdded?: (wallet: { name: string; address: string; network: string }) => void
}

const networks = [
  { value: "TRC20", label: "TRC20 (Tron)", description: "USDT on Tron network" },
  { value: "ERC20", label: "ERC20 (Ethereum)", description: "USDT on Ethereum network" },
  { value: "BEP20", label: "BEP20 (BSC)", description: "USDT on Binance Smart Chain" },
]

export function AddWalletDialog({ children, onWalletAdded }: AddWalletDialogProps) {
  const [open, setOpen] = useState(false)
  const [walletName, setWalletName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const { toast } = useToast()

  const isValidAddress = (address: string) => {
    // Basic validation for crypto addresses
    if (!address) return false
    
    // TRC20 addresses start with T and are 34 characters
    if (selectedNetwork === "TRC20") {
      return address.startsWith("T") && address.length === 34
    }
    
    // ERC20 and BEP20 addresses start with 0x and are 42 characters
    if (selectedNetwork === "ERC20" || selectedNetwork === "BEP20") {
      return address.startsWith("0x") && address.length === 42
    }
    
    return address.length >= 26 && address.length <= 62
  }

  const handleAddWallet = () => {
    if (walletName && walletAddress && selectedNetwork && isValidAddress(walletAddress)) {
      onWalletAdded?.({
        name: walletName,
        address: walletAddress,
        network: selectedNetwork,
      })
      
      toast({
        title: "Wallet Added",
        description: `${walletName} wallet has been added successfully.`,
      })
      
      // Reset form
      setWalletName("")
      setWalletAddress("")
      setSelectedNetwork("")
      setOpen(false)
    }
  }

  const canSubmit = walletName && walletAddress && selectedNetwork && isValidAddress(walletAddress)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
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
            <Label htmlFor="network">Network</Label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.value} value={network.value}>
                    <div>
                      <div className="font-medium">{network.label}</div>
                      <div className="text-xs text-gray-500">{network.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <div className="relative">
              <Input
                id="wallet-address"
                placeholder={
                  selectedNetwork === "TRC20" 
                    ? "T..." 
                    : selectedNetwork === "ERC20" || selectedNetwork === "BEP20"
                    ? "0x..."
                    : "Enter wallet address"
                }
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
                {selectedNetwork === "TRC20" 
                  ? "TRC20 addresses should start with 'T' and be 34 characters long"
                  : selectedNetwork === "ERC20" || selectedNetwork === "BEP20"
                  ? "Address should start with '0x' and be 42 characters long"
                  : "Please enter a valid wallet address"
                }
              </p>
            )}
          </div>

          {selectedNetwork && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>Important:</strong> Make sure this address supports USDT on the {selectedNetwork} network. 
                Sending to an incorrect address may result in permanent loss of funds.
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
  )
}