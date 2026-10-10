# Jinustan & Sharon — An Interactive 3D Reception

A full-screen, explorable Three.js garden reception, built with Next.js App Router, React, TypeScript, Framer Motion and GSAP. The scene is an imagined setting, not a reconstruction of Fr. Lopez Hall. Actual event information and all original photographs and the invitation are preserved.

## Explore

- Drag to orbit. Mouse-wheel, trackpad and button zoom use time-based damping for gradual movement. Pinch zoom and explicit reset controls are also available. Scrolling outside the canvas remains native.
- Click the stage, gallery easels, invitation stand, dining tables, cake, or welcome sign to move directly to that physical destination. No content drawers or photo modals interrupt the scene.
- The bottom navigation provides all the same destinations for keyboard and non-WebGL users.
- Take a guided camera tour. Manual camera interaction pauses the tour.
- Switch between evening and golden hour.
- Trigger a confetti celebration around the floral stage.
- Browse seven real gallery photographs in a three-frame garden display. Use the thumbnail filmstrip, on-screen or keyboard arrows, or click a neighboring photograph. Optional playback advances every 5.5 seconds and pauses on manual interaction.
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

- `app/wedding-world.ts`: procedural Three.js venue, actual photograph textures, OrbitControls, mesh raycasting, projected HTML hotspots, GSAP camera flights, lighting and confetti.
- `app/page.tsx`: experience shell, guided tour, compact scene controls, keyboard gallery navigation, calendar download and accessible fallback.
- `app/experience.css`: immersive interface and responsive destination controls.
- `app/layout.tsx`: metadata and sharing images.
- `public/images`: original imagery and optimized WebP versions.
- `public/fonts`: local Cormorant Garamond and Manrope.

The venue includes textured linen, wood, stone and grass; folded fabric, rounded furniture, glass lanterns, reflected ambient light, soft desktop shadows and separate twilight / golden-hour skies. The entrance moves to eye level down the aisle.

Flowers and foliage use instanced geometry; static decor is batched by material and destination to keep draw calls low. Shadow resolution and pixel ratio are capped. Rendering pauses while the browser is hidden. The venue stays alive while browsing its destinations. All geometry, textures, controls, timelines and renderer resources are disposed on unmount. Reduced motion disables auto-rotation, fireflies, confetti, photo fades, smooth scrolling and animated camera flights. If WebGL fails, the original photograph and all content actions remain available.

The reception is Tuesday, 20 October 2026 at 17:30 IST (12:00 UTC), Fr. Lopez Hall, Colachel. No end time was supplied, so the calendar does not invent one. No RSVP backend is simulated.

## Validation

Standard Next.js production compilation and TypeScript validation passed. CPU scene checks cover 1440×900, 390×844 and 320×568 camera setups, image aspect ratios, texture selection, lighting switches, zoom limits and resource disposal. Wheel checks verify gradual movement, matching responses at 60 / 120 Hz, line / pixel delta normalization and cancellation on destination changes. These checks do not verify GPU appearance; browser visual and interaction QA remains necessary on target devices.
