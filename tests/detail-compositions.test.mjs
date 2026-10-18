import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import test from "node:test";
import { eventDetailCopy } from "../src/components/content-page/events/EventDetailCopy.ts";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("each published story and event explicitly chooses ordered document IDs", () => {
  const schema = read("src/content.config.ts");
  assert.match(schema, /mode: z\.literal\("tabs"\),\s*views: z\.array\(z\.object\(\{[\s\S]*?\}\)\)\.min\(1\)/);
  for (const domain of ["stories", "events"]) {
    for (const folder of readdirSync(new URL(`src/content/${domain}/`, root), { withFileTypes: true })) {
      if (!folder.isDirectory()) continue;
      const base = `src/content/${domain}/${folder.name}/`;
      const recordPath = base + (domain === "stories" ? "story.json" : "event.json");
      if (!existsSync(new URL(recordPath, root))) continue;
      const record = JSON.parse(read(recordPath));
      const plan = record.content;
      assert.ok(plan?.mode === "article" || plan?.mode === "tabs", base);
      const views = plan.mode === "article" ? [{ sections: plan.sections }] : plan.views;
      if (plan.mode === "tabs") {
        assert.ok(views.length >= 1, base);
        assert.equal(new Set(views.map((view) => view.key)).size, views.length, base);
        for (const view of views) assert.ok(view.label.en && view.label.id, base);
      }
      for (const section of views.flatMap((view) => view.sections)) {
        assert.equal(typeof section.id, "string", base);
        assert.equal("type" in section, false, base);
        assert.ok(
          ["md", "mdx"].some((extension) =>
            existsSync(new URL(base + `${section.id}.en.${extension}`, root))),
          `${base}${section.id}.en.md[x]`,
        );
      }
    }
  }
  assert.deepEqual(Object.keys(eventDetailCopy.en), Object.keys(eventDetailCopy.id));
});

test("stories support optional localized sidebar facts and hide the demo story from directories", () => {
  const schema = read("src/content.config.ts");
  const catalog = read("src/lib/contentCatalog.ts");
  const route = read("src/pages/[...lang]/what-we-do/[single].astro");
  const fixture = JSON.parse(read("src/content/stories/story-sidebar-preview/story.json"));
  assert.match(schema, /sidebarFacts: z\.array\(z\.object\(\{[\s\S]*?\}\)\)\.max\(4\)\.optional\(\)/);
  assert.match(catalog, /includePreviewOnly \|\| !post\.data\.previewOnly/);
  assert.match(route, /getWhatWeDoActivities\(lang, \{ includePreviewOnly: true \}\)/);
  assert.match(route, /noindex=\{story\.data\.previewOnly\}/);
  assert.equal(fixture.previewOnly, true);
  assert.equal(fixture.sidebarFacts.length, 3);
});

test("both domains share the content renderer while retaining route-specific additions", () => {
  const composer = read("src/components/content-page/ContentBody.astro");
  const story = read("src/pages/[...lang]/what-we-do/[single].astro");
  const event = read("src/pages/[...lang]/events/[single].astro");
  assert.match(composer, /content\.mode === "article"/);
  assert.match(composer, /<BodyTabs/);
  assert.match(story, /<ContentLayout/);
  assert.match(story, /<PhotoStage/);
  assert.match(event, /<ContentLayout/);
  assert.match(event, /<EventSidebar/);
  assert.match(event, /<PhotoStage/);
  assert.doesNotMatch(story, /<EventSidebar|<EventAudience|<EventSpeaker/);
});

test("related reading is limited to What We Do story slugs", () => {
  const story = read("src/pages/[...lang]/what-we-do/[single].astro");
  const event = read("src/pages/[...lang]/events/[single].astro");
  assert.match(story, /<RelatedReading/);
  assert.doesNotMatch(event, /RelatedReading|getActivities/);
});

test("selected event recaps can be omitted from What We Do without leaving Events", () => {
  const catalog = read("src/lib/contentCatalog.ts");
  const directory = read("src/pages/[...lang]/what-we-do/index.astro");
  assert.match(catalog, /excludedEventRecaps/);
  assert.match(directory, /getWhatWeDoActivities/);
  for (const slug of [
    "dr-tb-advocacy-2024",
    "national-health-seminar-2025",
    "thyroid-screening-dialogue-2024",
  ]) {
    const event = JSON.parse(read(`src/content/events/${slug}/event.json`));
    assert.equal("showInWhatWeDo" in event, false, slug);
  }
  assert.match(read("src/components/directories/events/EventsListing.astro"), /getActivities/);
});

test("ContentLayout owns sticky sidebar placement while SidebarCard stays reusable", () => {
  const layout = read("src/layouts/ContentLayout.astro");
  const card = read("src/components/content-page/SidebarCard.astro");
  assert.match(layout, /<sidebar-sticky/);
  assert.match(layout, /SidebarSticky\.client/);
  assert.doesNotMatch(layout, /ContentSidebar/);
  assert.equal(
    existsSync(new URL("src/components/content-page/ContentSidebar.astro", root)),
    false,
  );
  assert.match(card, /data-reference-card/);
});

test("content tabs progressively enhance, support keyboard/history, and print all views", () => {
  const tabs = read("src/components/content-page/BodyTabs.astro");
  const client = read("src/components/content-page/BodyTabs.client.ts");
  assert.match(tabs, /hidden data-body-views/);
  assert.match(tabs, /data-detail-section/);
  assert.doesNotMatch(tabs, /BodySections|ContentSection/);
  assert.match(tabs, /print:block!/);
  for (const feature of ["tabpanel", "tablist", "aria-controls", "aria-selected",
    "ArrowRight", "ArrowLeft", "Home", "End", "hashchange", "popstate",
    "navigate", "disconnectedCallback"])
    assert.ok(client.includes(feature), feature);
  assert.match(client, /panels\.length > 1 && !printMedia\.matches/);
  assert.match(client, /panel\.hidden = enhanced &&/);
  assert.match(client, /dataset\.bodyView/);
  assert.match(client, /dataset\.bodyTab/);
  assert.match(tabs, /data-body-tab=\{view\.key\}/);
  assert.match(tabs, /data-body-view=\{view\.key\}/);
  assert.doesNotMatch(client, /dataset\.content(?:Tab|View)/);
  assert.doesNotMatch(client, /localStorage|sessionStorage|document\.cookie|MutationObserver/);
});

test("shared MDX blocks are reusable while event resources and recovered artwork stay distinct from recap photos", () => {
  const sections = read("src/components/content-page/ContentBody.astro");
  const mdx = "src/components/content-page/mdx/";
  const resources = read(mdx + "ResourceLinks.astro");
  const sempls = read("src/content/events/sem-pls-2025/invitationArchive.en.mdx");
  const ai = read("src/content/events/ai-literacy-2025/invitationArchive.en.mdx");
  const event = read("src/pages/[...lang]/events/[single].astro");
  assert.match(resources, /getLinkBehavior\(resource.href\)/);
  assert.doesNotMatch(resources, /<section|<h2|id="resources"/);
  assert.match(read("src/content/events/complete-event-preview/resources.en.mdx"), /<ResourceLinks/);
  assert.match(sempls, /content-page\/mdx\/QrCodeImage/);
  assert.match(ai, /content-page\/mdx\/QrCodeImage/);
  assert.match(sempls, /<InvitationFlyers/);
  assert.match(ai, /<InvitationFlyers/);
  assert.match(read(mdx + "InvitationFlyers.astro"), /<ContentPhoto/);
  assert.doesNotMatch(sections, /section\.type|section\.id === "invitationArchive"/);
  const audience = read(mdx + "AudienceList.astro");
  const objectives = read(mdx + "ObjectivesList.astro");
  const speaker = read(mdx + "SpeakerCard.astro");
  const practical = read(mdx + "PracticalDetailsList.astro");
  const topics = read(mdx + "TopicList.astro");
  assert.doesNotMatch(audience, /<section|<h2/);
  assert.doesNotMatch(objectives, /<section|<h2/);
  assert.doesNotMatch(speaker, /<section/);
  assert.doesNotMatch(practical, /<section|<h2/);
  assert.doesNotMatch(topics, /<section|<h2/);
  assert.doesNotMatch(sections, /EventProgramme|InvitationArchive/);
  assert.match(event, /event\.data\.resources\.length > 0 && sections\.some/);
  assert.match(read("src/content/events/ghld-2025/invitation.en.mdx"), /## Who Should Join/);
  assert.match(read("src/content/events/ghld-2025/details.en.mdx"), /## Speakers/);
  assert.doesNotMatch(sections, /BodySections|ContentSection/);
  assert.match(event, /slot="gallery"/);
  assert.match(event, /slot="reference"/);
  assert.match(event, /<EventSidebar[\s\S]*?\{hasMaterials\}/);
  assert.doesNotMatch(event, /<EventRegistration|href="#resources"/);
  const sidebar = read("src/components/content-page/events/EventSidebar.astro");
  assert.match(sidebar, /status !== "cancelled" && hasMaterials/);
  assert.match(sidebar, /<EventRegistration/);
});
