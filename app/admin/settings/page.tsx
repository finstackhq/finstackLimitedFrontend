'use client';

import { useEffect, useState } from 'react';
import { AnnouncementSettings } from '@/components/admin/AnnouncementSettings';
import { FeeSettings } from '@/components/admin/FeeSettings';

interface Settings {
  announcements: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    active: boolean;
    createdAt: string;
  }>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = async (type: string, data: any) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });

      if (response.ok) {
        // Refetch settings to update the UI
        const updatedResponse = await fetch('/api/admin/settings');
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setSettings(updatedData);
        }
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Settings</h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Platform Settings</h1>
      
      <div className="space-y-6">
        {/* Transaction Fee Settings */}
        <FeeSettings />
        
        {/* Announcement Settings */}
        <div className="max-w-2xl">
          {settings && (
            <AnnouncementSettings 
              announcements={settings.announcements}
              onUpdate={updateSetting}
            />
          )}
        </div>
      </div>
    </div>
  );
}