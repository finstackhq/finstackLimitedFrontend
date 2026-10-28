function count(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function normalizeAnnouncement(value) {
  if (!value || typeof value !== "object") {
    throw new Error("The announcements service returned an invalid announcement.");
  }

  const raw = value;
  const delivery =
    raw.delivery && typeof raw.delivery === "object" ? raw.delivery : {};
  const id = raw._id ?? raw.id;
  if (typeof id !== "string" || !id) {
    throw new Error("The announcements service returned an announcement without an ID.");
  }

  const recipientCount = count(raw.recipientCount ?? delivery.recipientCount);
  const sentCount = count(raw.sentCount ?? delivery.sent);
  const failedCount = count(raw.failedCount ?? delivery.failed);

  return {
    id,
    title: typeof raw.title === "string" ? raw.title : "",
    body: typeof raw.body === "string" ? raw.body : "",
    status: typeof raw.status === "string" ? raw.status : "UNKNOWN",
    recipientCount,
    sentCount,
    failedCount,
    pendingCount: count(
      delivery.pending,
      Math.max(recipientCount - sentCount - failedCount, 0),
    ),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : undefined,
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : undefined,
  };
}

export function normalizeAnnouncementListResponse(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.data)) {
    throw new Error("The announcements service returned an invalid history response.");
  }

  const pagination =
    value.pagination && typeof value.pagination === "object"
      ? value.pagination
      : {};
  const page = count(pagination.page, 1);
  const limit = count(pagination.limit, 20);
  const total = count(pagination.total, value.data.length);

  return {
    announcements: value.data.map(normalizeAnnouncement),
    page,
    limit,
    total,
    totalPages: Math.max(
      1,
      count(
        pagination.totalPages,
        Math.max(1, Math.ceil(total / Math.max(limit, 1))),
      ),
    ),
  };
}

export function isTerminalAnnouncementStatus(status) {
  return ["COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"].includes(status);
}

export function validateAnnouncementContent(value) {
  if (!value || typeof value !== "object") {
    return "An announcement title and body are required.";
  }

  const { title, body } = value;
  if (typeof title !== "string" || !title.trim() || title.length > 160) {
    return "Title is required and must be 160 characters or fewer.";
  }
  if (typeof body !== "string" || !body.trim() || body.length > 20_000) {
    return "Body is required and must be 20,000 characters or fewer.";
  }
  return null;
}

export function announcementContent(value) {
  return { title: value.title, body: value.body };
}

export function omitAnnouncementRecipients(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const { recipients, ...safeResponse } = value;
  return safeResponse;
}
