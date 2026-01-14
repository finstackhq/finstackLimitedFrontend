'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  active: boolean;
  createdAt: string;
}

interface AnnouncementSettingsProps {
  announcements: Announcement[];
  onUpdate: (type: string, data: any) => Promise<void>;
}

export function AnnouncementSettings({ announcements, onUpdate }: AnnouncementSettingsProps) {
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onUpdate('announcement', {
        action: 'create',
        announcement: newAnnouncement
      });
      
      setNewAnnouncement({ title: '', message: '', type: 'info' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await onUpdate('announcement', {
        action: 'toggle',
        id
      });
    } catch (error) {
      console.error('Failed to toggle announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onUpdate('announcement', {
        action: 'delete',
        id
      });
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Announcements</CardTitle>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Announcement
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-200 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Announcement message"
                required
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={newAnnouncement.type} 
                onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Create Announcement
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No announcements found</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(announcement.type)}>
                      {getTypeIcon(announcement.type)}
                      {announcement.type}
                    </Badge>
                    {announcement.active && (
                      <Badge variant="outline" className="text-green-600">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={announcement.active}
                      onCheckedChange={() => handleToggle(announcement.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-1">
                  {announcement.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {announcement.message}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {formatDate(announcement.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}