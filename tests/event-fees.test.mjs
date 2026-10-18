import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getFeeState } from "../src/components/content-page/events/FeeState.ts";

const read = (file) =>
  readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const rate = {
  opensAt: "2026-10-01T00:00:00+07:00",
  closesAt: "2026-11-01T00:00:00+07:00",
};

test("rates open inclusively and close exclusively across explicit timezone offsets", () => {
  const opens = Date.parse(rate.opensAt);
  const closes = Date.parse(rate.closesAt);
  assert.equal(getFeeState(rate, opens - 1), "scheduled");
  assert.equal(getFeeState(rate, opens), "current");
  assert.equal(getFeeState(rate, closes - 1), "current");
  assert.equal(getFeeState(rate, closes), "ended");
  assert.equal(getFeeState({ opensAt: rate.closesAt }, closes), "current");
  assert.equal(getFeeState({ closesAt: rate.closesAt }, closes), "ended");
});

test("undated, invalid and archived pricing never implies current availability", () => {
  assert.equal(getFeeState({}), "standard");
  assert.equal(getFeeState({ opensAt: "invalid" }), "standard");
  assert.equal(
    getFeeState({ opensAt: rate.closesAt, closesAt: rate.opensAt }),
    "standard",
  );
  assert.equal(getFeeState(rate, Date.parse(rate.opensAt), true), "standard");
});

test("early bird and regular hand over without overlapping availability", () => {
  const regular = { opensAt: rate.closesAt };
  const boundary = Date.parse(rate.closesAt);
  assert.equal(getFeeState(rate, boundary - 1), "current");
  assert.equal(getFeeState(regular, boundary - 1), "scheduled");
  assert.equal(getFeeState(rate, boundary), "ended");
  assert.equal(getFeeState(regular, boundary), "current");
});

test("event sidebar leads with practical facts, keeps a short inclusions summary and safe enquiries", () => {
  const event = read("src/components/content-page/events/EventSidebar.astro");
  const fees = read("src/components/content-page/events/EventFees.astro");
  assert.match(event, /<SidebarCard/);
  assert.match(event, /data-event-facts/);
  assert.ok(
    event.indexOf('slot="facts"') < event.indexOf('slot="action"'),
  );
  assert.match(fees, /compact && fee\.includesSummary/);
  assert.match(fees, /\{fee\.includesSummary\}/);
  assert.doesNotMatch(fees, /set:html=\{fee\.includesSummary\}/);
  assert.ok(
    event.indexOf("<EventRegistration") < event.indexOf("data-event-enquiry"),
  );
  assert.match(
    event,
    /const contact = invitationData\?\.contact\?\.links\[0\]/,
  );
  assert.match(event, /contact\?\.href \?\? "#event-enquiries"/);
  assert.match(event, /getLinkBehavior\(href\)/);
  assert.match(event, /hasMaterials\?: boolean/);
  assert.match(event, /<EventRegistration/);
  assert.match(event, /href="#resources"/);
  assert.doesNotMatch(
    read("src/pages/[...lang]/events/[single].astro"),
    /<EventRegistration|registrationDeadline|href="#resources"/,
  );
  assert.match(
    read("src/pages/[...lang]/events/[single].astro"),
    /id="event-enquiries"/,
  );
  assert.match(event, /upcoming \? \([\s\S]*?data-event-enquiry/);
});

test("sidebar fees are independent of registration and share the detailed renderer", () => {
  const event = read("src/components/content-page/events/EventSidebar.astro");
  const details = read("src/content/events/ghld-2025/details.en.mdx");
  assert.match(event, /const fee = invitationData\?\.fees/);
  assert.ok(event.indexOf("<EventFees") < event.indexOf("data-sidebar-utilities"));
  assert.match(details, /<EventFees/);
  assert.match(details, /archived=\{true\}/);
  assert.doesNotMatch(event, /singleFee/);
  const component = read("src/components/content-page/events/EventFees.astro");
  assert.match(component, /compact && visibleRateCount > 4/);
  assert.match(event, /href="#participation"/);
  const client = read("src/components/content-page/events/EventFees.client.ts");
  assert.match(client, /visibilitychange/);
  assert.match(client, /disconnectedCallback/);
  assert.match(client, /clearTimeout\(this.timer\)/);
});

test("expired prices are hidden only in summaries, with history and an all-ended fallback retained", () => {
  const component = read("src/components/content-page/events/EventFees.astro");
  const client = read("src/components/content-page/events/EventFees.client.ts");
  assert.match(component, /compact\s*\? "[^"]*data-\[state=ended\]:hidden/);
  assert.match(component, /data-\[state=ended\]:text-muted-foreground/);
  assert.match(component, /data-fee-empty/);
  assert.match(client, /visibleRateCount > 0/);
  assert.match(client, /count\.textContent = String\(visibleRateCount\)/);
});
