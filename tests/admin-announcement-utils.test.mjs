import assert from "node:assert/strict";
import test from "node:test";
import {
  isTerminalAnnouncementStatus,
  normalizeAnnouncement,
  normalizeAnnouncementListResponse,
  omitAnnouncementRecipients,
  validateAnnouncementContent,
} from "../lib/admin/announcement-utils.mjs";

test("normalizes backend announcement IDs, content, and delivery counts", () => {
  const announcement = normalizeAnnouncement({
    _id: "announcement-1",
    title: "Maintenance",
    body: "<p>Brief downtime</p>",
    status: "PROCESSING",
    recipientCount: 12,
    delivery: { sent: 7, failed: 2, pending: 3 },
    createdAt: "2026-10-28T12:00:00.000Z",
  });

  assert.equal(announcement.id, "announcement-1");
  assert.equal(announcement.body, "<p>Brief downtime</p>");
  assert.equal(announcement.sentCount, 7);
  assert.equal(announcement.failedCount, 2);
  assert.equal(announcement.pendingCount, 3);
  assert.equal(announcement.recipientCount, 12);
});

test("normalizes announcement history pagination and rejects malformed rows", () => {
  const history = normalizeAnnouncementListResponse({
    success: true,
    data: [{ _id: "announcement-2", delivery: { sent: 1, failed: 0 } }],
    pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
  });

  assert.equal(history.announcements[0].id, "announcement-2");
  assert.equal(history.page, 2);
  assert.equal(history.totalPages, 2);
  assert.throws(
    () => normalizeAnnouncementListResponse({ success: true, data: [{}] }),
    /without an ID/,
  );
});

test("recognizes terminal delivery statuses", () => {
  assert.equal(isTerminalAnnouncementStatus("COMPLETED"), true);
  assert.equal(isTerminalAnnouncementStatus("COMPLETED_WITH_ERRORS"), true);
  assert.equal(isTerminalAnnouncementStatus("FAILED"), true);
  assert.equal(isTerminalAnnouncementStatus("PROCESSING"), false);
});

test("validates announcement content against the backend limits", () => {
  assert.equal(validateAnnouncementContent({ title: "A", body: "<p>Body</p>" }), null);
  assert.equal(validateAnnouncementContent({ title: "T".repeat(160), body: "B" }), null);
  assert.equal(validateAnnouncementContent({ title: "A", body: "B".repeat(20_000) }), null);
  assert.equal(validateAnnouncementContent({ title: "T".repeat(161), body: "B" }) !== null, true);
  assert.equal(validateAnnouncementContent({ title: "A", body: "B".repeat(20_001) }) !== null, true);
});

test("omits recipient personal data from routine announcement responses", () => {
  const response = omitAnnouncementRecipients({
    success: true,
    data: { _id: "announcement-3" },
    recipients: [{ email: "private@example.test" }],
  });

  assert.deepEqual(response, {
    success: true,
    data: { _id: "announcement-3" },
  });
});
