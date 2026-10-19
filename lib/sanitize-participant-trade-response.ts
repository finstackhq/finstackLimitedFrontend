export function sanitizeParticipantTradeResponse<T>(response: T): T {
  const sanitize = (value: unknown, insidePaymentDetails = false): unknown => {
    if (Array.isArray(value)) {
      return value.map((item) => sanitize(item, insidePaymentDetails));
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).flatMap(([key, nestedValue]) => {
          if (insidePaymentDetails && key === "alipayEmail") return [];
          return [[key, sanitize(nestedValue, key === "paymentDetails")]];
        }),
      );
    }

    return value;
  };

  return sanitize(response) as T;
}