'use client';

import { AnnouncementSettings } from '@/components/admin/AnnouncementSettings';
import { FeeSettings } from '@/components/admin/FeeSettings';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
        Platform Settings
      </h1>

      <div className="space-y-6">
        <FeeSettings />
        <AnnouncementSettings />
      </div>
    </div>
  );
}
