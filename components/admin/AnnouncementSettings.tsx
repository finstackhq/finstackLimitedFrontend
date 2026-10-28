'use client';

import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  isTerminalAnnouncementStatus,
  normalizeAnnouncement,
  normalizeAnnouncementListResponse,
  type Announcement,
} from '@/lib/admin/announcement-utils.mjs';

const HISTORY_LIMIT = 10;
const RECIPIENT_LIMIT = 10;
const MAX_POLL_ATTEMPTS = 6;
const TEST_EMAIL_COPY = {
  title: 'FinStack email delivery test',
  body:
    '<p>This is a test email from FinStack. No action is required.</p><p>We are confirming that the announcement email service is delivering messages correctly.</p><p>If you have any questions, contact our support team at <a href="mailto:hello@usefinstack.co">hello@usefinstack.co</a>.</p><p>Kind regards,<br>The FinStack Team</p>',
};

const EMAIL_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'i',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'u',
  'ul',
]);
const DROP_CONTENT_TAGS = new Set([
  'iframe',
  'object',
  'script',
  'style',
  'svg',
]);

function renderAnnouncementHtml(html: string): ReactNode {
  const document = new DOMParser().parseFromString(html, 'text/html');

  const renderNode = (node: ChildNode, key: string): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (!(node instanceof Element)) return null;

    const tag = node.tagName.toLowerCase();
    if (DROP_CONTENT_TAGS.has(tag)) return null;
    const children = Array.from(node.childNodes).map((child, index) =>
      renderNode(child, `${key}-${index}`),
    );
    if (!EMAIL_TAGS.has(tag)) return children;
    if (tag === 'br') return createElement('br', { key });

    if (tag === 'a') {
      const rawHref = node.getAttribute('href');
      if (!rawHref) return children;
      try {
        const href = new URL(rawHref, window.location.origin);
        if (!['http:', 'https:', 'mailto:'].includes(href.protocol)) {
          return children;
        }
        return createElement('a', {
          key,
          href: href.toString(),
          rel: 'noreferrer',
          className: 'text-blue-700 underline underline-offset-2',
          children,
        });
      } catch {
        return children;
      }
    }

    return createElement(
      tag,
      {
        key,
        className:
          tag === 'blockquote'
            ? 'border-l-2 border-gray-300 pl-3 italic'
            : undefined,
      },
      children,
    );
  };

  return Array.from(document.body.childNodes).map((node, index) =>
    renderNode(node, `announcement-${index}`),
  );
}

function AnnouncementBody({ body }: { body: string }) {
  const [formattedBody, setFormattedBody] = useState<ReactNode>(body);

  useEffect(() => {
    setFormattedBody(renderAnnouncementHtml(body));
  }, [body]);

  return (
    <div className="break-words text-sm text-gray-600 [&_blockquote]:my-2 [&_h1]:mb-1 [&_h1]:font-semibold [&_h2]:mb-1 [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:my-2 [&_ol]:list-decimal [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc">
      {formattedBody}
    </div>
  );
}

interface AnnouncementRecipient {
  email: string;
  status: string;
  error?: string;
  createdAt?: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

interface QueueResult {
  id: string;
  status: string;
  recipientCount: number;
}

function responseMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const record = payload as Record<string, unknown>;
  if (typeof record.error === 'string') return record.error;
  if (typeof record.message === 'string') return record.message;
  return fallback;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusStyle(status: string): string {
  if (status === 'COMPLETED') return 'bg-green-100 text-green-800';
  if (status === 'COMPLETED_WITH_ERRORS' || status === 'FAILED') {
    return 'bg-red-100 text-red-800';
  }
  if (status === 'QUEUED' || status === 'PROCESSING') {
    return 'bg-amber-100 text-amber-800';
  }
  return 'bg-gray-100 text-gray-700';
}

export function AnnouncementSettings() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [testCopyLoaded, setTestCopyLoaded] = useState(false);
  const [sendConfirmationOpen, setSendConfirmationOpen] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [announcementSending, setAnnouncementSending] = useState(false);
  const testRequestInFlight = useRef(false);
  const announcementRequestInFlight = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [queueResult, setQueueResult] = useState<QueueResult | null>(null);

  const [history, setHistory] = useState<{
    announcements: Announcement[];
    page: number;
    totalPages: number;
    total: number;
  }>({ announcements: [], page: 1, totalPages: 1, total: 0 });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [polling, setPolling] = useState(false);
  const [showFailedRecipients, setShowFailedRecipients] = useState(false);
  const [recipients, setRecipients] = useState<AnnouncementRecipient[]>([]);
  const [recipientPagination, setRecipientPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  const loadHistory = useCallback(async (page: number) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await fetch(
        `/api/admin/announcements?page=${page}&limit=${HISTORY_LIMIT}`,
        { cache: 'no-store' },
      );
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseMessage(payload, 'Could not load announcement history.'));
      }

      const result = normalizeAnnouncementListResponse(payload);
      setHistory(result);
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : 'Could not load announcement history.',
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadDetails = useCallback(
    async (
      id: string,
      options: {
        page?: number;
        status?: 'failed';
        includeRecipients?: boolean;
        showLoading?: boolean;
      } = {},
    ) => {
      const {
        page = 1,
        status,
        includeRecipients = false,
        showLoading = true,
      } = options;
      if (showLoading) setDetailsLoading(true);
      if (includeRecipients) setRecipientsLoading(true);
      setDetailsError(null);

      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(includeRecipients ? RECIPIENT_LIMIT : 1),
        });
        if (status) query.set('status', status);
        if (includeRecipients) query.set('includeRecipients', 'true');

        const response = await fetch(
          `/api/admin/announcements/${encodeURIComponent(id)}?${query.toString()}`,
          { cache: 'no-store' },
        );
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(responseMessage(payload, 'Could not load announcement details.'));
        }
        if (
          !payload ||
          typeof payload !== 'object' ||
          !('data' in payload)
        ) {
          throw new Error('The announcements service returned invalid details.');
        }

        const record = payload as Record<string, unknown>;
        const announcement = normalizeAnnouncement(record.data);
        setSelectedAnnouncement(announcement);

        if (includeRecipients) {
          if (!Array.isArray(record.recipients)) {
            throw new Error('The service returned invalid recipient details.');
          }
          const pagination =
            record.pagination && typeof record.pagination === 'object'
              ? (record.pagination as Record<string, unknown>)
              : {};
          setRecipients(
            record.recipients.map((item) => {
              const recipient =
                item && typeof item === 'object'
                  ? (item as Record<string, unknown>)
                  : {};
              return {
                email: typeof recipient.email === 'string' ? recipient.email : '—',
                status:
                  typeof recipient.status === 'string' ? recipient.status : 'unknown',
                error:
                  typeof recipient.error === 'string' ? recipient.error : undefined,
                createdAt:
                  typeof recipient.createdAt === 'string'
                    ? recipient.createdAt
                    : undefined,
              };
            }),
          );
          setRecipientPagination({
            page: Number(pagination.page) || page,
            totalPages: Number(pagination.totalPages) || 1,
            total: Number(pagination.total) || 0,
          });
        }
        return true;
      } catch (error) {
        setDetailsError(
          error instanceof Error
            ? error.message
            : 'Could not load announcement details.',
        );
        return false;
      } finally {
        if (showLoading) setDetailsLoading(false);
        if (includeRecipients) setRecipientsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadHistory(1);
  }, [loadHistory]);

  useEffect(() => {
    if (
      !selectedId ||
      !selectedAnnouncement ||
      isTerminalAnnouncementStatus(selectedAnnouncement.status) ||
      pollCount >= MAX_POLL_ATTEMPTS ||
      polling
    ) {
      return;
    }

    const timer = window.setTimeout(async () => {
      setPolling(true);
      await loadDetails(selectedId, { showLoading: false });
      setPollCount((current) => current + 1);
      setPolling(false);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [loadDetails, pollCount, polling, selectedAnnouncement, selectedId]);

  const handleTestEmail = async () => {
    if (testRequestInFlight.current) return;
    testRequestInFlight.current = true;
    setFormError(null);
    setFormSuccess(null);
    setQueueResult(null);
    setTestSending(true);

    try {
      const response = await fetch('/api/admin/announcements/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseMessage(payload, 'Could not send the test email.'));
      }

      const data =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data?: { email?: unknown } }).data
          : undefined;
      const email = typeof data?.email === 'string' ? ` to ${data.email}` : '';
      setFormSuccess(`Test email sent${email}. It was sent to the admin account email.`);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not send the test email.',
      );
    } finally {
      testRequestInFlight.current = false;
      setTestSending(false);
    }
  };

  const loadTestEmailCopy = () => {
    setTitle(TEST_EMAIL_COPY.title);
    setBody(TEST_EMAIL_COPY.body);
    setTestCopyLoaded(true);
    setFormError(null);
    setFormSuccess(null);
    setQueueResult(null);
  };

  const handleSendToAll = async () => {
    if (announcementRequestInFlight.current) return;
    announcementRequestInFlight.current = true;
    setSendConfirmationOpen(false);
    setFormError(null);
    setFormSuccess(null);
    setQueueResult(null);
    setAnnouncementSending(true);

    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, confirmSendToAll: true }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseMessage(payload, 'Could not queue the announcement.'));
      }
      if (response.status !== 202) {
        throw new Error(
          `The service returned ${response.status} instead of 202 Accepted. Check announcement history before attempting another send.`,
        );
      }

      const data =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as {
              data?: {
                announcementId?: unknown;
                status?: unknown;
                recipientCount?: unknown;
              };
            }).data
          : undefined;
      if (typeof data?.announcementId !== 'string' || !data.announcementId) {
        throw new Error(
          'The response did not include an announcement ID. Check history before attempting another send.',
        );
      }
      const recipientCount = Number(data.recipientCount);
      if (
        typeof data.status !== 'string' ||
        !data.status ||
        !Number.isFinite(recipientCount) ||
        recipientCount < 0
      ) {
        throw new Error(
          'The queue response did not include a valid status and recipient count. Check history before attempting another send.',
        );
      }

      const result = {
        id: data.announcementId,
        status: data.status,
        recipientCount,
      };
      setQueueResult(result);
      setFormSuccess(
        'The announcement was accepted and queued. It has not necessarily been delivered yet.',
      );
      setSelectedId(result.id);
      setSelectedAnnouncement(null);
      setShowFailedRecipients(false);
      setRecipients([]);
      setPollCount(0);
      await loadHistory(1);
      await loadDetails(result.id);
    } catch (error) {
      setFormError(
        `${error instanceof Error ? error.message : 'Could not queue the announcement.'} No automatic retry was made. If the connection failed after submission, check announcement history before trying again to avoid creating a duplicate.`,
      );
    } finally {
      announcementRequestInFlight.current = false;
      setAnnouncementSending(false);
    }
  };

  const openAnnouncement = async (id: string) => {
    setSelectedId(id);
    setSelectedAnnouncement(null);
    setDetailsError(null);
    setShowFailedRecipients(false);
    setRecipients([]);
    setPollCount(0);
    await loadDetails(id);
  };

  const showFailedRecipientPage = async (page: number) => {
    if (!selectedId) return;
    setShowFailedRecipients(true);
    await loadDetails(selectedId, {
      page,
      status: 'failed',
      includeRecipients: true,
    });
  };

  const refreshSelected = async () => {
    if (!selectedId) return;
    setPollCount(0);
    await loadDetails(selectedId);
    if (showFailedRecipients) await showFailedRecipientPage(recipientPagination.page);
  };

  const submitting = testSending || announcementSending;
  const canSend = Boolean(title.trim() && body.trim()) && !submitting;
  const terminal = selectedAnnouncement
    ? isTerminalAnnouncementStatus(selectedAnnouncement.status)
    : false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-gray-600">
            Compose an email for users. The email template adds “Hello [first
            name],” automatically; do not add another greeting to the message.
            Basic HTML is supported and sanitized by the server. For customer
            announcements, clearly explain what is changing, when it takes
            effect, and whether users need to take action.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              Avoid internal testing language in messages sent to all users.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadTestEmailCopy}
              disabled={submitting}
            >
              Load polished test-email copy
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              maxLength={160}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setTestCopyLoaded(false);
              }}
              placeholder="Announcement title"
              disabled={submitting}
            />
            <p className="text-right text-xs text-gray-500">{title.length}/160</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-body">Message / body</Label>
            <Textarea
              id="announcement-body"
              maxLength={20_000}
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setTestCopyLoaded(false);
              }}
              placeholder="Explain the update, when it takes effect, and any action users need to take. Basic HTML is supported."
              rows={8}
              disabled={submitting}
            />
            <p className="text-right text-xs text-gray-500">
              {body.length.toLocaleString()}/20,000
            </p>
          </div>

          {formError && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mr-2 inline h-4 w-4" />
              {formError}
            </div>
          )}
          {formSuccess && (
            <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {formSuccess}
            </p>
          )}

          {queueResult && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Announcement queued (not delivered yet)</p>
              <dl className="mt-2 grid gap-1 sm:grid-cols-3">
                <div>
                  <dt className="font-medium">ID</dt>
                  <dd className="break-all">{queueResult.id}</dd>
                </div>
                <div>
                  <dt className="font-medium">Status</dt>
                  <dd>{queueResult.status}</dd>
                </div>
                <div>
                  <dt className="font-medium">Recipients</dt>
                  <dd>{queueResult.recipientCount.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestEmail}
              disabled={!canSend}
            >
              {testSending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send test email
            </Button>
            <Button
              type="button"
              onClick={() => {
                setFormError(null);
                setFormSuccess(null);
                setSendConfirmationOpen(true);
              }}
              disabled={!canSend || testCopyLoaded}
            >
              {announcementSending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send to all users
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            A test email goes only to the logged-in admin account email. Sending
            to all users queues a separate email for every user with an email
            address.
          </p>
          {testCopyLoaded && (
            <p role="status" className="text-sm font-medium text-amber-800">
              This draft is for testing only. Edit the title or message before
              sending to all users.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Announcement history</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              {history.total.toLocaleString()} announcements
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadHistory(history.page)}
            disabled={historyLoading}
          >
            <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {historyError && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {historyError}
            </div>
          )}

          {historyLoading ? (
            <div className="space-y-3" aria-label="Loading announcement history">
              <div className="h-20 animate-pulse rounded-md bg-gray-100" />
              <div className="h-20 animate-pulse rounded-md bg-gray-100" />
            </div>
          ) : history.announcements.length === 0 && !historyError ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No email announcements have been queued yet.
            </p>
          ) : (
            <div className="space-y-3">
              {history.announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-md border border-gray-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {announcement.title || 'Untitled announcement'}
                        </h3>
                        <Badge className={statusStyle(announcement.status)}>
                          {announcement.status}
                        </Badge>
                      </div>
                      <div className="max-h-24 overflow-hidden">
                        <AnnouncementBody body={announcement.body} />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Queued {formatDate(announcement.createdAt)} ·{' '}
                        {announcement.recipientCount.toLocaleString()} recipients ·{' '}
                        {announcement.sentCount.toLocaleString()} sent ·{' '}
                        {announcement.failedCount.toLocaleString()} failed
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void openAnnouncement(announcement.id)}
                    >
                      View progress
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadHistory(history.page - 1)}
              disabled={historyLoading || history.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {history.page} of {history.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadHistory(history.page + 1)}
              disabled={historyLoading || history.page >= history.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Delivery progress</CardTitle>
              <p className="mt-1 break-all text-sm text-gray-500">{selectedId}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshSelected()}
              disabled={detailsLoading || polling}
            >
              <RefreshCw className={`h-4 w-4 ${polling ? 'animate-spin' : ''}`} />
              Refresh progress
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailsError && (
              <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {detailsError}
              </div>
            )}
            {detailsLoading && !selectedAnnouncement ? (
              <p className="text-sm text-gray-500">Loading announcement details…</p>
            ) : selectedAnnouncement ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {selectedAnnouncement.title || 'Untitled announcement'}
                  </h3>
                  <Badge className={statusStyle(selectedAnnouncement.status)}>
                    {selectedAnnouncement.status}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ['Recipients', selectedAnnouncement.recipientCount],
                    ['Sent', selectedAnnouncement.sentCount],
                    ['Failed', selectedAnnouncement.failedCount],
                    ['Pending', selectedAnnouncement.pendingCount],
                  ].map(([label, count]) => (
                    <div key={label} className="rounded-md border border-gray-200 p-3">
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {Number(count).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-gray-700">Created</dt>
                    <dd className="text-gray-600">
                      {formatDate(selectedAnnouncement.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700">Last updated</dt>
                    <dd className="text-gray-600">
                      {formatDate(
                        selectedAnnouncement.completedAt ??
                          selectedAnnouncement.updatedAt ??
                          selectedAnnouncement.startedAt,
                      )}
                    </dd>
                  </div>
                </dl>

                {!terminal && (
                  <p className="text-sm text-gray-500" role="status">
                    {pollCount < MAX_POLL_ATTEMPTS
                      ? `Refreshing automatically every 5 seconds (${MAX_POLL_ATTEMPTS - pollCount} checks remaining).`
                      : 'Automatic refresh paused after 30 seconds. Use “Refresh progress” to check again.'}
                  </p>
                )}

                <div className="border-t pt-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">Failed recipients</h4>
                      <p className="text-xs text-gray-500">
                        Email addresses are personal data; view them only when
                        needed to investigate delivery failures.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (showFailedRecipients) {
                          setShowFailedRecipients(false);
                          setRecipients([]);
                        } else {
                          void showFailedRecipientPage(1);
                        }
                      }}
                      disabled={recipientsLoading}
                    >
                      {recipientsLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {showFailedRecipients ? 'Hide failed recipients' : 'View failed recipients'}
                    </Button>
                  </div>

                  {showFailedRecipients && (
                    <div className="mt-4 space-y-3">
                      {recipientsLoading ? (
                        <p className="text-sm text-gray-500">
                          Loading failed recipient records…
                        </p>
                      ) : recipients.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No failed recipient records are available.
                        </p>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[36rem] text-left text-sm">
                              <thead>
                                <tr className="border-b text-xs uppercase text-gray-500">
                                  <th className="px-3 py-2 font-medium">Email</th>
                                  <th className="px-3 py-2 font-medium">Failure</th>
                                  <th className="px-3 py-2 font-medium">Recorded</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recipients.map((recipient, index) => (
                                  <tr
                                    key={`${recipient.email}-${index}`}
                                    className="border-b last:border-0"
                                  >
                                    <td className="break-all px-3 py-2">
                                      {recipient.email}
                                    </td>
                                    <td className="px-3 py-2">
                                      {recipient.error || recipient.status}
                                    </td>
                                    <td className="px-3 py-2">
                                      {formatDate(recipient.createdAt)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                void showFailedRecipientPage(
                                  recipientPagination.page - 1,
                                )
                              }
                              disabled={
                                recipientsLoading || recipientPagination.page <= 1
                              }
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                              Page {recipientPagination.page} of{' '}
                              {recipientPagination.totalPages} ·{' '}
                              {recipientPagination.total} failed records
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                void showFailedRecipientPage(
                                  recipientPagination.page + 1,
                                )
                              }
                              disabled={
                                recipientsLoading ||
                                recipientPagination.page >=
                                  recipientPagination.totalPages
                              }
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={sendConfirmationOpen}
        onOpenChange={setSendConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Queue this email for all users?</AlertDialogTitle>
            <AlertDialogDescription>
              This queues “{title}” for every user with an email address. A
              queued email is not necessarily delivered yet. Submitting again
              creates a separate announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={announcementSending}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={() => void handleSendToAll()}
              disabled={announcementSending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Queue email to all users
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
