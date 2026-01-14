'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Share2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Transaction {
  id: string;
  date: string;
  type: "Deposit" | "Withdraw" | "P2P";
  wallet: "NGN" | "USDT" | "USDC" | "CNGN" | "RMB";
  amount: number;
  status: "Pending" | "Completed" | "Failed";
  reference: string;
  // P2P specific fields
  buyer?: {
    name: string;
    email: string;
    amount: number;
  };
  seller?: {
    name: string;
    email: string;
    amount: number;
  };
  paymentMethod?: string;
}

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionReceiptModal({ transaction, isOpen, onClose }: TransactionReceiptModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "Pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <Check className="w-4 h-4" />;
      case "Failed":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "NGN":
      case "CNGN":
        return "₦";
      case "USDT":
      case "USDC":
        return "$";
      case "RMB":
        return "¥";
      default:
        return "";
    }
  };

  const exportAsPDF = async () => {
    if (!transaction) {
      console.error('No transaction data available');
      return;
    }
    
    console.log('Starting PDF export for transaction:', transaction.reference);
    setIsExporting(true);
    
    try {
      const element = document.getElementById('receipt-content');
      if (!element) {
        console.error('Receipt content element not found');
        alert('Receipt content not found. Please try again.');
        return;
      }

      console.log('Found receipt element, creating canvas...');
      
      // Wait a bit for any images to load
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: true,
      });

      console.log('Canvas created successfully, generating PDF...');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = `finstack-receipt-${transaction.reference}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF export successful:', fileName);
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to export PDF: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsImage = async () => {
    if (!transaction) {
      console.error('No transaction data available');
      return;
    }
    
    console.log('Starting image export for transaction:', transaction.reference);
    setIsExporting(true);
    
    try {
      const element = document.getElementById('receipt-content');
      if (!element) {
        console.error('Receipt content element not found');
        alert('Receipt content not found. Please try again.');
        return;
      }

      console.log('Found receipt element, creating canvas...');
      
      // Wait a bit for any images to load
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: true,
      });

      console.log('Canvas created successfully, generating image...');

      // Create download link
      const link = document.createElement('a');
      const fileName = `finstack-receipt-${transaction.reference}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Image export successful:', fileName);
      alert('Image downloaded successfully!');
    } catch (error) {
      console.error('Error exporting image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to export image: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-transparent border-0 shadow-none">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-2.5 bg-gradient-to-r from-[#2F67FA] to-[#4a7bff] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-100 p-1">
                  <img 
                    src="https://otiktpyazqotihijbwhm.supabase.co/storage/v1/object/public/images/0c185682-fa1d-4cba-8553-43f6102c311c-logo.png"
                    alt="Finstack logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.logo-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'logo-fallback w-full h-full bg-gradient-to-br from-[#2F67FA] to-[#4a7bff] rounded-full flex items-center justify-center text-white font-bold text-xs';
                        fallback.textContent = 'F';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Finstack</h2>
                  <p className="text-sm text-blue-100">Transaction Receipt</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Receipt Content */}
          <div id="receipt-content" className="p-3 bg-white">
            {/* Logo and Branding */}
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-1.5 border border-gray-200 p-1">
                <img 
                  src="https://otiktpyazqotihijbwhm.supabase.co/storage/v1/object/public/images/0c185682-fa1d-4cba-8553-43f6102c311c-logo.png"
                  alt="Finstack logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.logo-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'logo-fallback w-full h-full bg-gradient-to-br from-[#2F67FA] to-[#4a7bff] rounded-full flex items-center justify-center text-white font-bold text-xs';
                      fallback.textContent = 'F';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Finstack</h1>
              <p className="text-xs text-gray-600">Digital Financial Services</p>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2F67FA] to-transparent mt-1.5"></div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-2">
              {/* Status */}
              <div className="text-center">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium",
                  getStatusColor(transaction.status)
                )}>
                  {getStatusIcon(transaction.status)}
                  <span>{transaction.status}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center py-2">
                <p className="text-xs text-gray-600 mb-0.5">Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  {getCurrencySymbol(transaction.wallet)}
                  {transaction.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500">{transaction.wallet} Wallet</p>
              </div>

              {/* Transaction Info */}
              <div className="bg-gray-50 rounded-lg p-2.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Transaction Type</span>
                  <span className="text-xs font-medium text-gray-900">{transaction.type}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Reference</span>
                  <span className="text-xs font-mono font-medium text-gray-900">{transaction.reference}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Date & Time</span>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Wallet</span>
                  <span className="text-xs font-medium text-gray-900">{transaction.wallet}</span>
                </div>

                {transaction.paymentMethod && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Payment Method</span>
                    <span className="text-xs font-medium text-gray-900">{transaction.paymentMethod}</span>
                  </div>
                )}
              </div>

              {/* P2P Party Information */}
              {transaction.type === 'P2P' && (transaction.buyer || transaction.seller) && (
                <div className="space-y-2">
                  {/* Buyer Information */}
                  {transaction.buyer && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">B</span>
                        </div>
                        <h4 className="text-xs font-semibold text-green-900">Buyer Details</h4>
                      </div>
                      <div className="space-y-1.5 pl-8">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-green-700">Name</span>
                          <span className="text-xs font-medium text-green-900">{transaction.buyer.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-green-700">Email</span>
                          <span className="text-xs font-medium text-green-900 truncate max-w-[180px]">{transaction.buyer.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-green-700">Amount</span>
                          <span className="text-xs font-bold text-green-900">
                            {getCurrencySymbol(transaction.wallet)}
                            {transaction.buyer.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seller Information */}
                  {transaction.seller && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <h4 className="text-xs font-semibold text-blue-900">Seller Details</h4>
                      </div>
                      <div className="space-y-1.5 pl-8">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-700">Name</span>
                          <span className="text-xs font-medium text-blue-900">{transaction.seller.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-700">Email</span>
                          <span className="text-xs font-medium text-blue-900 truncate max-w-[180px]">{transaction.seller.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-700">Amount</span>
                          <span className="text-xs font-bold text-blue-900">
                            {getCurrencySymbol(transaction.wallet)}
                            {transaction.seller.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security Notice */}
              <div className="border-l-4 border-[#2F67FA] bg-blue-50 p-2 rounded-r-lg">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Security Notice:</span> This receipt is digitally generated and serves as proof of your transaction.
                </p>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Generated on {new Date().toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  Finstack - Your trusted financial partner
                </p>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="p-2.5 bg-gray-50 border-t">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log('PDF export button clicked');
                  exportAsPDF();
                }}
                disabled={isExporting}
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white h-8 text-xs"
              >
                <Download className="w-3 h-3 mr-1.5" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                onClick={() => {
                  console.log('Image export button clicked');
                  exportAsImage();
                }}
                disabled={isExporting}
                variant="outline"
                className="flex-1 border-[#2F67FA] text-[#2F67FA] hover:bg-[#2F67FA]/10 h-8 text-xs"
              >
                <Share2 className="w-3 h-3 mr-1.5" />
                {isExporting ? 'Exporting...' : 'Export Image'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}