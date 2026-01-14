'use client';

import { MerchantAdWizard } from '@/components/merchant/MerchantAdWizard';

export default function PostMerchantAdPage() {
  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Post P2P Ad</h1>
        <p className="text-sm text-gray-600">Create a new merchant offer following live market rates.</p>
      </div>
      <MerchantAdWizard />
    </div>
  );
}
