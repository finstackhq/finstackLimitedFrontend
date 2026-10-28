export interface Announcement {
  id: string;
  title: string;
  body: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AnnouncementHistory {
  announcements: Announcement[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function normalizeAnnouncement(value: unknown): Announcement;
export function normalizeAnnouncementListResponse(
  value: unknown,
): AnnouncementHistory;
export function isTerminalAnnouncementStatus(status: string): boolean;
export function validateAnnouncementContent(value: unknown): string | null;
export function announcementContent(value: Record<string, unknown>): {
  title: unknown;
  body: unknown;
};
export function omitAnnouncementRecipients(value: unknown): unknown;
