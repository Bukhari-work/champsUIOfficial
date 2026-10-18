import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) =>
  readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const details = "src/components/content-page/events/";

test("live events use the selected production sidebar without an override", () => {
  const sidebar = read(details + "EventSidebar.astro");
  assert.match(sidebar, /data-event-sidebar/);
  assert.match(sidebar, /<SidebarCard/);
  assert.match(sidebar, /data-event-facts/);
  assert.match(sidebar, /<EventFees[^>]*compact/);
  assert.ok(
    sidebar.indexOf('slot="facts"') <
      sidebar.indexOf('slot="action"'),
  );
});

test("pricing and enquiry utilities remain secondary to registration and safe without fees", () => {
  const panel = read(details + "EventSidebar.astro");
  assert.ok(
    panel.indexOf("<EventRegistration") <
      panel.indexOf("data-sidebar-utilities"),
  );
  assert.match(panel, /href="#participation"/);
  assert.match(panel, /icon="LuReceiptText"/);
  assert.match(panel, /icon="LuMessageCircle"/);
  assert.match(panel, /contact\?\.href \?\? "#event-enquiries"/);
  assert.match(panel, /!fee && "col-span-2"/);
  assert.match(panel, /invitationData\?: EventInvitationData/);
  assert.match(panel, /upcoming \? \(/);
  assert.match(panel, /hasMaterials\?: boolean/);
  assert.match(panel, /href="#resources"/);
  assert.doesNotMatch(panel, /underline|fixtures|demo-|variant ===/);
});

test("the baseline ticket uses date-driven highlighting and hides only expired summary rows", () => {
  const fees = read(details + "EventFees.astro");
  assert.match(fees, /data-\[state=current\]:bg-primary-soft/);
  assert.match(
    fees,
    /grid grid-cols-2 gap-x-3 gap-y-1 rounded-r-lg border-l-2/,
  );
  assert.match(fees, /compact \? "space-y-2" : "space-y-3"/);
  assert.match(fees, /<div class="mt-1">[\s\S]*?data-fee-status/);
  assert.match(fees, /data-\[state=ended\]:hidden/);
  assert.match(fees, /group-data-\[state=current\]:bg-primary/);
  assert.match(fees, /\[\[hidden\]\]:hidden!/);
  assert.doesNotMatch(
    fees,
    /Early bird|earlyBird|<button|<input|onclick=|tabindex=/,
  );
});

test("archived events preserve date precision and lifecycle notices with icon-led facts", () => {
  const facts = read(details + "EventSidebar.astro");
  for (const marker of [
    "LuCalendarDays",
    "LuMapPin",
    "LuPresentation",
    "eventCopy.monthOnly",
    "eventCopy.cancelledNote",
    "eventCopy.closed",
  ])
    assert.ok(facts.includes(marker), marker);
  assert.match(facts, /class="sr-only"/);
  assert.match(read(details + "EventSidebar.astro"), /status !== "cancelled" && hasMaterials/);
});
