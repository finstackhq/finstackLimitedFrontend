'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { RatingType } from '@/lib/p2p-mock-data';
import { cn } from '@/lib/utils';

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: RatingType, comment: string) => void;
}

export function RatingModal({ open, onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState<RatingType>('positive');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setRating('positive');
    setComment('');
  };

  const ratings: { type: RatingType; label: string; icon: any; color: string }[] = [
    { type: 'positive', label: 'Positive', icon: ThumbsUp, color: 'bg-green-100 text-green-700 border-green-300' },
    { type: 'neutral', label: 'Neutral', icon: Minus, color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { type: 'negative', label: 'Negative', icon: ThumbsDown, color: 'bg-red-100 text-red-700 border-red-300' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate This Trade</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-3">How was your experience?</p>
            <div className="grid grid-cols-3 gap-3">
              {ratings.map(r => {
                const Icon = r.icon;
                const active = rating === r.type;
                return (
                  <button
                    key={r.type}
                    onClick={() => setRating(r.type)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition flex flex-col items-center gap-2',
                      active ? r.color : 'bg-white hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Additional Comments (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
