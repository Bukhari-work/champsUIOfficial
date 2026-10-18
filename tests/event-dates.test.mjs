import test from "node:test";
import assert from "node:assert/strict";
import { getEventStatus, formatEventDate, formatEventMonth } from "../src/lib/eventDates.ts";

test("completed and cancelled are editorial facts, not inferred from a date", () => {
  assert.equal(
    getEventStatus({ period: "2024-10", status: "completed" }),
    "completed",
  );
  assert.equal(
    getEventStatus({ period: "2024-10", status: "cancelled" }),
    "cancelled",
  );
});

test("an invitation becomes past, not completed, after its date", () => {
  const event = {
    period: "2025-10",
    startDate: "2025-10-30",
    status: "scheduled",
  };
  assert.equal(
    getEventStatus(event, new Date("2025-10-29T00:00:00Z")),
    "upcoming",
  );
  assert.equal(getEventStatus(event, new Date("2025-10-31T00:00:00Z")), "past");
});

test("multi-day events stay upcoming through the final Jakarta calendar day", () => {
  const event = {
    period: "2024-08",
    startDate: "2024-08-05",
    endDate: "2024-08-09",
    status: "scheduled",
  };
  assert.equal(
    getEventStatus(event, new Date("2024-08-09T16:59:00Z")),
    "upcoming",
  );
  assert.equal(getEventStatus(event, new Date("2024-08-09T17:00:00Z")), "past");
});

test("month-only records do not invent an exact day", () => {
  const event = { period: "2024-10", status: "scheduled" };
  assert.equal(formatEventDate(event, "en"), "October 2024");
  assert.equal(formatEventDate(event, "id"), "Oktober 2024");
  assert.equal(
    getEventStatus(event, new Date("2024-10-31T00:00:00Z")),
    "upcoming",
  );
  assert.equal(getEventStatus(event, new Date("2024-11-01T00:00:00Z")), "past");
});

test("directory card dates use month and year even when exact event dates exist", () => {
  assert.equal(formatEventMonth("2025-10", "en"), "October 2025");
  assert.equal(formatEventMonth("2025-10", "id"), "Oktober 2025");
});

test("exact dates and date ranges use the same UTC date in both locales", () => {
  const day = {
    period: "2025-07",
    startDate: "2025-07-17",
    status: "completed",
  };
  assert.equal(formatEventDate(day, "en"), "July 17, 2025");
  assert.equal(formatEventDate(day, "id"), "17 Juli 2025");
  const range = { ...day, startDate: "2025-07-17", endDate: "2025-07-19" };
  assert.match(formatEventDate(range, "en"), /17.*19.*2025/);
});
