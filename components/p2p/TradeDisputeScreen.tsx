'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, AlertTriangle, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradeDisputeScreenProps {
  tradeId: string;
  reference: string;
  paidAt: Date;
  cryptoCurrency: string;
  fiatCurrency: string;
  cryptoAmount: number;
  fiatAmount: number;
  disputeThresholdMinutes?: number;
  onDisputeSubmitted?: () => void;
}

export function TradeDisputeScreen({
  tradeId,
  reference,
  paidAt,
  cryptoCurrency,
  fiatCurrency,
  cryptoAmount,
  fiatAmount,
  disputeThresholdMinutes = 15,
  onDisputeSubmitted
}: TradeDisputeScreenProps) {
  const { toast } = useToast();
  const [elapsedTime, setElapsedTime] = useState('');
  const [canDispute, setCanDispute] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeRaised, setDisputeRaised] = useState(false);
  const [disputeReason, setDisputeReason] = useState('no_response');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const updateElapsedTime = () => {
      const now = new Date().getTime();
      const paid = new Date(paidAt).getTime();
      const diff = now - paid;
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsedTime(`${minutes}m ${seconds}s`);
      
      // Enable dispute after threshold
      if (minutes >= disputeThresholdMinutes) {
        setCanDispute(true);
      }
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);
    
    return () => clearInterval(interval);
  }, [paidAt, disputeThresholdMinutes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setDisputeEvidence(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDispute = async () => {
    if (!disputeDetails.trim()) {
      toast({
        title: 'Details Required',
        description: 'Please provide details about the issue.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      const res = await fetch('/api/fstack/p2p/dispute-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          reason: disputeReason,
          details: disputeDetails,
          evidence: disputeEvidence
        })
      });

      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDisputeRaised(true);
      setShowDisputeForm(false);
      
      toast({
        title: 'Dispute Submitted',
        description: 'Our support team will review your case within 24 hours.'
      });

      onDisputeSubmitted?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit dispute',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (disputeRaised) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-12 h-12 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold">Dispute Submitted</h2>
              <p className="text-gray-600">
                Our support team has been notified and is reviewing your case.
              </p>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dispute ID:</span>
                    <span className="font-mono font-medium">DSP-{Date.now()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trade Reference:</span>
                    <span className="font-mono">{reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-orange-600 font-medium">Under Review</span>
                  </div>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertTitle>What happens next?</AlertTitle>
                <AlertDescription className="text-sm mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Our team will review the evidence you provided</li>
                    <li>Both parties will be contacted for verification</li>
                    <li>A resolution will be provided within 24-48 hours</li>
                    <li>You'll be notified via email about the outcome</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showDisputeForm) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Raise a Dispute</CardTitle>
            <p className="text-sm text-gray-600">
              Please provide details about the issue you're experiencing
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reason Selection */}
            <div className="space-y-3">
              <Label>What's the issue?</Label>
              <RadioGroup value={disputeReason} onValueChange={setDisputeReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_response" id="no_response" />
                  <Label htmlFor="no_response" className="font-normal cursor-pointer">
                    Merchant is not responding
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="payment_not_received" id="payment_not_received" />
                  <Label htmlFor="payment_not_received" className="font-normal cursor-pointer">
                    Merchant claims they didn't receive payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="crypto_not_released" id="crypto_not_released" />
                  <Label htmlFor="crypto_not_released" className="font-normal cursor-pointer">
                    Crypto has not been released after payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal cursor-pointer">
                    Other issue
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details">Please provide details *</Label>
              <Textarea
                id="details"
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                placeholder="Describe the issue in detail. Include any relevant transaction IDs, timestamps, or communication history..."
                className="min-h-[120px]"
              />
            </div>

            {/* Evidence Upload */}
            <div className="space-y-2">
              <Label>Upload Evidence (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {disputeEvidence ? (
                  <div className="space-y-3">
                    <img 
                      src={disputeEvidence} 
                      alt="Evidence" 
                      className="max-w-full h-48 object-contain mx-auto rounded"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDisputeEvidence(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">Upload screenshot or proof</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDisputeForm(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDispute}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Waiting State
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Waiting Animation */}
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">Waiting for Merchant Confirmation</h2>
              <p className="text-gray-600">
                Please wait while the merchant verifies your payment
              </p>
            </div>

            {/* Timer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Time elapsed since payment</div>
              <div className="text-3xl font-bold font-mono text-blue-600">{elapsedTime}</div>
            </div>

            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">You Paid</span>
                <span className="font-medium">{fiatAmount} {fiatCurrency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">You'll Receive</span>
                <span className="font-medium">{cryptoAmount} {cryptoCurrency}</span>
              </div>
            </div>

            {/* Information Alert */}
            <Alert>
              <AlertTitle>Please be patient</AlertTitle>
              <AlertDescription className="text-sm">
                The merchant has been notified of your payment. They typically confirm within 15-30 minutes.
                {!canDispute && (
                  <p className="mt-2">
                    You'll be able to raise a dispute after {disputeThresholdMinutes} minutes if there's no response.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            {/* Dispute Button */}
            {canDispute && (
              <Button
                onClick={() => setShowDisputeForm(true)}
                variant="destructive"
                className="w-full"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Raise a Dispute
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
