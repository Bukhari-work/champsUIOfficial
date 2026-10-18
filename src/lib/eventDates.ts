// Date-only values are compared in the event's local calendar, not the viewer's.
export interface EventDates {
  period: string;
  startDate?: string;
  endDate?: string;
  status: "scheduled" | "completed" | "cancelled";
}
export type EventStatus = "upcoming" | "past" | "completed" | "cancelled";

export function getEventStatus(
  event: EventDates,
  now = new Date(),
): EventStatus {
  if (event.status !== "scheduled") return event.status;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const end = event.endDate ?? event.startDate;
  // For month-only invitations, the whole month remains the known event window.
  return (end ? end < today : event.period < today.slice(0, 7))
    ? "past"
    : "upcoming";
}

export function formatEventDate(event: EventDates, lang: string): string {
  const formatter = new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "long",
    ...(event.startDate ? { day: "numeric" } : {}),
    timeZone: "UTC",
  });
  const start = new Date(
    `${event.startDate ?? event.period + "-01"}T00:00:00Z`,
  );
  return event.endDate && event.endDate !== event.startDate
    ? formatter.formatRange(start, new Date(`${event.endDate}T00:00:00Z`))
    : formatter.format(start);
}

export function formatEventMonth(period: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${period}-01T00:00:00Z`));
}
