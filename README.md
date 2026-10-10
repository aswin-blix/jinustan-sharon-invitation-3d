# Jinustan & Sharon — An Interactive 3D Reception

A full-screen, explorable Three.js garden reception, built with Next.js App Router, React, TypeScript, Framer Motion and GSAP. The scene is an imagined setting, not a reconstruction of Fr. Lopez Hall. Actual event information and all original photographs and the invitation are preserved.

## Reuse and customize

All invitation-specific content lives in one typed file: `app/invitation-config.ts`. Update that file to reuse the experience; the interface, accessible fallback, SEO metadata, calendar download and 3D venue all consume the same values.

1. Change `identity`, `people`, `event` and `venue`. The displayed date/time and `.ics` calendar data are derived from the single ISO timestamp in `event.start` using the configured IANA time zone.
2. Put replacement files under `public/` and update `media`. The gallery accepts any non-empty number of images; counters, playback, thumbnails and 3D frames stay synchronized automatically. Every image entry includes its accessible alt text.
3. Customize all interface language under `zones` and `copy`, plus the 3D text, responsive destination-camera framing, invitation stand, tabletop celebration card and compact venue-card dimensions under `scene`.
4. Change the interface palette and fonts under `theme.css`. Change the materials, sky, lights, flowers, particles and 3D canvas fonts under `theme.world`.
5. Update the optional credit link and `seo.fallbackBaseUrl`. Replace the configured favicon asset if the initials or mark change.

Keep `scene.venueCard` wider than it is tall; its card artwork scales vertically with the configured dimensions.
Keep `scene.invitationDisplay.supportDepth` behind the framed artwork and its paired supports inside the frame edges.
Keep `scene.celebrationCard` upright and positioned on a table surface; its camera framing, angle and displayed event details all follow that single configuration.

Keep public asset paths root-relative (for example, `/images/couple.webp`). Run `npm test` after editing the configuration; it checks the date/calendar derivation, destination completeness, gallery labels, theme values and whether every configured local asset exists.

## Explore

- Drag to orbit. Mouse-wheel, trackpad and button zoom use time-based damping for gradual movement. Pinch zoom and explicit reset controls are also available. Scrolling outside the canvas remains native.
- Click the stage, gallery easels, invitation stand, dining tables, cake, or welcome sign to move directly to that physical destination. No content drawers or photo modals interrupt the scene.
- The bottom navigation provides all the same destinations for keyboard and non-WebGL users.
- Take a guided camera tour. Manual camera interaction pauses the tour.
- Switch between evening and golden hour.
- Trigger a confetti celebration around the floral stage.
- Browse the configured gallery photographs in a three-frame garden display. Use the thumbnail filmstrip, on-screen or keyboard arrows, or click a neighboring photograph. Optional playback follows `behavior.galleryAutoplayMs` and pauses on manual interaction.
- Photographs crossfade inside their frames, preserving portrait / landscape proportions and your camera position. Gallery textures are cached after the first visit.
- Switch between the couple and individual portraits at the stage. Qualifications and event details appear on physical boards.
- Use Look closer to inspect the invitation or photograph with the navigation hidden.
- Download the original invitation, save the calendar event, or open Google Maps directions.

## Standard Next.js / Vercel

Use Node 22.13+ and pnpm 11.25.0:

```
pnpm install
pnpm dev:next
pnpm build:next
pnpm start:next
```

On Vercel select Next.js, with `pnpm build:next` as the build command. No API keys or backend are needed. The hosted Sites version uses the supplied Vinext compatibility runtime; `pnpm dev` and `pnpm build` are reserved for its workflow.

## Source

- `app/invitation-config.ts`: the single source of truth for names, profiles, event/venue details, all copy, images, links, behavior timings, SEO inputs and both the interface and 3D color themes.
- `app/wedding-world.ts`: procedural Three.js venue, actual photograph textures, OrbitControls, mesh raycasting, projected HTML hotspots, GSAP camera flights, lighting and confetti.
- `app/page.tsx`: experience shell, guided tour, compact scene controls, keyboard gallery navigation, calendar download and accessible fallback.
- `app/experience.css`: immersive interface and responsive destination controls.
- `app/layout.tsx`: metadata and sharing images.
- `public/images`: original imagery and optimized WebP versions.
- `public/fonts`: local Cormorant Garamond and Manrope.

The venue includes textured linen, wood, stone and grass; folded fabric, rounded furniture, glass lanterns, reflected ambient light, filtered desktop shadows and separate twilight / golden-hour skies. The entrance moves to eye level down the aisle.

Flowers and foliage use instanced geometry; static decor is batched by material and destination to keep draw calls low. Shadow resolution and pixel ratio are capped. Rendering pauses while the browser is hidden. The venue stays alive while browsing its destinations. All geometry, textures, controls, timelines and renderer resources are disposed on unmount. Reduced motion disables auto-rotation, fireflies, confetti, photo fades, smooth scrolling and animated camera flights. If WebGL fails, the original photograph and all content actions remain available.

The included sample has no event end time, so the generated calendar does not invent one. No RSVP backend is simulated.

## Validation

Use the checks in this order after a customization:

```text
npm test
npm run typecheck
npm run lint
npm run build:next
```

The automated configuration tests cover derived dates and calendar output, public asset existence, gallery uniqueness and alt text, destination completeness, and theme token validity. The production build validates the React and Three.js integration. Browser visual and interaction QA is still recommended on representative desktop and mobile devices because automated checks do not verify GPU appearance.
