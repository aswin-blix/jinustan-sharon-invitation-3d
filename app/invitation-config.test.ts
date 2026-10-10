import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  createCalendarContent,
  eventDisplay,
  fillTemplate,
  invitationAssetPaths,
  invitationConfig,
  zoneOrder,
} from "./invitation-config.ts";

test("the event timestamp drives every formatted date", () => {
  const date = new Date(invitationConfig.event.start);
  assert.ok(Number.isFinite(date.getTime()));

  const dateParts = new Intl.DateTimeFormat(invitationConfig.event.dateLocale, {
    timeZone: invitationConfig.event.timeZone,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((value) => value.type === type)?.value ?? "";
  const expectedTime = new Intl.DateTimeFormat(invitationConfig.event.timeLocale, {
    timeZone: invitationConfig.event.timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  assert.equal(
    eventDisplay.dateLong,
    `${part("weekday")}, ${part("day")} ${part("month")} ${part("year")}`,
  );
  assert.equal(eventDisplay.date, `${part("day")} ${part("month")} ${part("year")}`);
  assert.equal(
    eventDisplay.timeWithZone,
    `${expectedTime} ${invitationConfig.event.timeZoneLabel}`,
  );
});

test("calendar output is generated from the shared event and venue data", () => {
  const calendar = createCalendarContent(new Date("2026-10-10T00:00:00Z"));
  const unfolded = calendar.replaceAll("\r\n ", "");
  const toCalendarUtc = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escapeCalendarText = (value: string) =>
    value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,");
  const venue = [
    invitationConfig.venue.name,
    invitationConfig.venue.locality,
    invitationConfig.venue.region,
    invitationConfig.venue.country,
  ].join(", ");

  assert.ok(unfolded.includes("DTSTAMP:20261010T000000Z"));
  assert.ok(
    unfolded.includes(
      `DTSTART:${toCalendarUtc(new Date(invitationConfig.event.start))}`,
    ),
  );
  assert.ok(
    unfolded.includes(
      `SUMMARY:${escapeCalendarText(`${invitationConfig.identity.displayName} — ${invitationConfig.event.title}`)}`,
    ),
  );
  assert.ok(unfolded.includes(`LOCATION:${escapeCalendarText(venue)}`));
  assert.ok(calendar.endsWith("END:VCALENDAR\r\n"));
  for (const line of calendar.split("\r\n")) {
    assert.ok(Buffer.byteLength(line, "utf8") <= 75, `calendar line is too long: ${line}`);
  }
});

test("configured media has useful labels and points to tracked public assets", () => {
  assert.ok(invitationConfig.media.gallery.length > 0);
  assert.equal(
    new Set(invitationConfig.media.gallery.map((image) => image.src)).size,
    invitationConfig.media.gallery.length,
  );

  for (const image of invitationConfig.media.gallery) {
    assert.ok(image.alt.trim().length > 0, `${image.src} needs alt text`);
  }

  for (const assetPath of invitationAssetPaths) {
    assert.ok(assetPath.startsWith("/"), `${assetPath} must be root-relative`);
    assert.ok(
      existsSync(join(process.cwd(), "public", assetPath.slice(1))),
      `${assetPath} does not exist under public`,
    );
  }
});

test("gallery-dependent copy supports any configured image count", () => {
  const result = fillTemplate(invitationConfig.zones.moments.chapter, {
    count: invitationConfig.media.gallery.length,
  });
  assert.ok(!result.includes("{count}"));
});

test("every destination has one complete configuration entry", () => {
  assert.deepEqual(Object.keys(invitationConfig.zones), [...zoneOrder]);

  for (const zone of zoneOrder) {
    const content = invitationConfig.zones[zone];
    assert.ok(content.title && content.navLabel && content.caption && content.chapter);
  }
});

test("responsive scene framing keeps the physical displays configurable", () => {
  const camera = invitationConfig.scene.camera;
  const invitationDisplay = invitationConfig.scene.invitationDisplay;
  const celebrationCard = invitationConfig.scene.celebrationCard;
  const venueCard = invitationConfig.scene.venueCard;
  assert.ok(camera.mobileBreakpointPx > 0);
  assert.ok(Math.abs(invitationDisplay.angle) < Math.PI / 2);
  assert.ok(invitationDisplay.width > 0 && invitationDisplay.height > 0);
  assert.ok(invitationDisplay.cameraWidth >= invitationDisplay.width);
  assert.ok(invitationDisplay.cameraHeight >= invitationDisplay.height);
  assert.ok(invitationDisplay.supportOffset > 0, "the invitation supports must stay separated");
  assert.ok(
    Math.abs(invitationDisplay.supportOffset) + 0.045 < invitationDisplay.width / 2,
    "the invitation supports must stay inside the frame edges",
  );
  assert.ok(
    invitationDisplay.supportDepth + 0.045 < -0.01,
    "the invitation supports must remain behind the framed artwork",
  );
  assert.ok(Math.abs(celebrationCard.angle) < Math.PI / 2);
  assert.ok(celebrationCard.width > 0 && celebrationCard.height > 0);
  assert.ok(
    celebrationCard.height > celebrationCard.width,
    "the celebration card should keep an upright menu composition",
  );
  assert.ok(celebrationCard.cameraWidth >= celebrationCard.width);
  assert.ok(celebrationCard.cameraHeight >= celebrationCard.height);

  const [cardX, cardY, cardZ] = celebrationCard.position;
  const tableSurfaceY = 1.47 + 0.06 / 2;
  const tableCenterX = 7;
  const tableCenterZ = 0.5;
  const tableRadius = 2.15;
  assert.ok(
    Math.abs(cardY - celebrationCard.height / 2 - 0.07 - tableSurfaceY) < 0.01,
    "the celebration card base must rest on the dining table surface",
  );
  assert.ok(
    Math.hypot(cardX - tableCenterX, cardZ - tableCenterZ) + celebrationCard.width / 2 < tableRadius,
    "the celebration card must remain inside the tabletop",
  );

  const viewport = { width: 390, height: 844 };
  assert.ok(viewport.width < camera.mobileBreakpointPx);
  const verticalFov = 50 * (Math.PI / 180);
  const distance = Math.max(
    celebrationCard.cameraHeight / (2 * Math.tan(verticalFov / 2) * 0.6),
    celebrationCard.cameraWidth /
      (2 * Math.tan(verticalFov / 2) * (viewport.width / viewport.height) * 0.74),
    2.5,
  );
  const cameraX = cardX + Math.sin(celebrationCard.angle) * distance;
  const cameraZ = cardZ + Math.cos(celebrationCard.angle) * distance;
  assert.ok(
    Math.hypot(cameraX - tableCenterX, cameraZ - tableCenterZ) > tableRadius + 0.5,
    "the Celebration camera must remain outside the dining table",
  );
  assert.ok(venueCard.width > 0 && venueCard.height > 0);
  assert.ok(
    venueCard.width / venueCard.height > 1.35,
    "the venue card should keep a compact landscape composition",
  );
  assert.ok(venueCard.cameraWidth >= venueCard.width);
  assert.ok(venueCard.cameraHeight >= venueCard.height);
});

test("theme tokens use valid reusable CSS values", () => {
  for (const [token, value] of Object.entries(invitationConfig.theme.css)) {
    assert.match(token, /^--theme-/);
    if (token.includes("font")) {
      assert.ok(value.trim().length > 0, `${token} must not be empty`);
    } else {
      assert.match(value, /^#[\da-f]{6}(?:[\da-f]{2})?$/i, `${token} is not a hex color`);
    }
  }

  const worldColors = Object.entries(invitationConfig.theme.world).filter(
    ([key]) => !key.endsWith("Font"),
  );
  for (const [key, value] of worldColors) {
    const colors = Array.isArray(value) ? value : [value];
    for (const color of colors) {
      assert.match(color, /^#[\da-f]{6}(?:[\da-f]{2})?$/i, `${key} is not a hex color`);
    }
  }
});
