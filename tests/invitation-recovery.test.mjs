import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import { resolveInvitationAssets } from "../src/lib/eventInvitationAssets.ts";

const root = new URL("../", import.meta.url);
const assets = [
  "ai-literacy-bpjs-2025/flyer.jpg",
  "ai-literacy-bpjs-2025/registration-qr.png",
  "ai-literacy-bpjs-2025/speaker-1.webp",
  "ai-literacy-bpjs-2025/speaker-2.webp",
  "ai-literacy-bpjs-2025/speaker-3.webp",
  "ghld-foundational-2025/front.jpg",
  "ghld-foundational-2025/programme.jpg",
  "ghld-foundational-2025/registration-qr.jpg",
  "ghld-foundational-2025/speaker-1.webp",
  "ghld-foundational-2025/speaker-2.webp",
  "ghld-foundational-2025/speaker-3.webp",
  "sem-pls-health-policy-2025/flyer.jpg",
  "sem-pls-health-policy-2025/registration-qr.png",
  "sem-pls-health-policy-2025/speaker-1.webp",
  "sem-pls-health-policy-2025/speaker-2.webp",
];

test("event invitations, flyers, portraits, and QR assets exist and are nonempty", () => {
  for (const file of assets) {
    const path = new URL(`public/images/events/${file}`, root);
    assert.ok(existsSync(path), file);
    assert.ok(readFileSync(path).length > 0, file);
  }
});

test("GHLD event content names all speakers and includes both flyer sides", () => {
  const event = JSON.parse(readFileSync(
    new URL("src/content/events/ghld-2025/event.json", root), "utf8",
  ));
  const details = readFileSync(new URL("src/content/events/ghld-2025/details.en.mdx", root), "utf8");
  const invitation = readFileSync(new URL("src/content/events/ghld-2025/invitation.en.mdx", root), "utf8");
  assert.equal(event.flyers.length, 2);
  assert.match(details, /Raditya M\. Kusumaningprang/);
  assert.match(details, /speaker-3\.webp/);
  assert.match(details, /frontmatter\.speakers\?\.map/);
  assert.doesNotMatch(details, /invitation\.speakers/);
  assert.match(invitation, /InvitationFlyers/);
  assert.ok(!details.includes("tna-champs.webp"));
});

test("AI Literacy and SEM-PLS use brief-derived speaker names and their own flyers", () => {
  for (const [name, prefix, count, qr] of [
    ["ai-literacy-2025", "ai-literacy-bpjs-2025", 3, "registration-qr.png"],
    ["sem-pls-2025", "sem-pls-health-policy-2025", 2, "registration-qr.png"],
  ]) {
    const event = JSON.parse(
      readFileSync(
        new URL(`src/content/events/${name}/event.json`, root),
        "utf8",
      ),
    );
    assert.notEqual(event.listingOnly, true);
    assert.equal(event.invitation, undefined);
    assert.equal(event.recap, undefined);
    assert.equal(event.registration, undefined);
    assert.equal(event.flyers.length, 1);
    assert.ok(existsSync(new URL(`public${event.flyers[0].src}`, root)));
    assert.equal(event.invitationArchive.speakerImages.length, count);
    assert.equal(event.invitationArchive.qrCode.src, `/images/events/${prefix}/${qr}`);
    for (const [
      index,
      image,
    ] of event.invitationArchive.speakerImages.entries()) {
      assert.equal(
        image.src,
        `/images/events/${prefix}/speaker-${index + 1}.webp`,
      );
    }
    for (const image of [
      ...event.invitationArchive.speakerImages,
      event.invitationArchive.qrCode,
    ]) {
      assert.ok(existsSync(new URL(`public${image.src}`, root)), image.src);
      assert.ok(image.alt.en.trim());
      assert.ok(image.alt.id.trim());
    }
  }
});

test("archival assets resolve localized copy without duplicating named invitation portraits", () => {
  const event = JSON.parse(
    readFileSync(
      new URL("src/content/events/ai-literacy-2025/event.json", root),
      "utf8",
    ),
  );
  for (const lang of ["en", "id"]) {
    const result = resolveInvitationAssets(event.invitationArchive, lang);
    assert.deepEqual(result.speakerImages[0], {
      src: event.invitationArchive.speakerImages[0].src,
      alt: event.invitationArchive.speakerImages[0].alt[lang],
    });
    assert.equal(result.qrCode.alt, event.invitationArchive.qrCode.alt[lang]);
  }
  const qr = { src: "/images/events/ghld-foundational-2025/registration-qr.jpg", alt: "Original QR" };
  assert.deepEqual(resolveInvitationAssets(undefined, "en", qr), {
    speakerImages: [],
    qrCode: qr,
  });
  assert.equal(resolveInvitationAssets(undefined, "en"), undefined);
});
