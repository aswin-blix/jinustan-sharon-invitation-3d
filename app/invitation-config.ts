/**
 * The reusable content and visual theme for this invitation.
 *
 * Start here when adapting the experience for another couple or event. The
 * React interface, metadata, calendar download, fallback content and 3D scene
 * all read from this single object.
 */
export const zoneOrder = [
  "couple",
  "invitation",
  "moments",
  "celebration",
  "venue",
] as const;

export type Zone = (typeof zoneOrder)[number];
export type View = Zone | "overview";

export const invitationConfig = {
  identity: {
    slug: "jinustan-sharon-reception",
    firstNames: ["Jinustan", "Sharon"],
    connector: "&",
    displayName: "Jinustan & Sharon",
    fullNames: "Jinustan Raj and Sharon Roja",
    initials: ["J", "S"],
  },

  people: {
    together: {
      label: "Together",
      name: "Jinustan & Sharon",
      detail: "Two hearts. One journey. Together in His Grace.",
      image: "/images/couple.webp",
      alt: "Jinustan and Sharon together",
    },
    partners: [
      {
        label: "Jinustan",
        name: "Jinustan Raj",
        credentials: "M.Sc., B.Ed., M.Div.",
        roles: ["Pastor, Educator &", "Mathematics Content Creator"],
        image: "/images/groom.webp",
        alt: "Portrait of Jinustan Raj",
      },
      {
        label: "Sharon",
        name: "Sharon Roja",
        credentials: "M.Sc., B.Ed.",
        roles: ["Mathematics Teacher", "Narayana E-Techno, Madurai"],
        image: "/images/bride.webp",
        alt: "Portrait of Sharon Roja",
      },
    ],
  },

  event: {
    title: "Wedding Reception",
    start: "2026-10-20T17:30:00+05:30",
    timeZone: "Asia/Kolkata",
    timeZoneLabel: "IST",
    timeZoneName: "Indian Standard Time",
    dateLocale: "en-GB",
    timeLocale: "en-US",
  },

  venue: {
    name: "Fr. Lopez Hall",
    locality: "Colachel",
    region: "Kanyakumari District, Tamil Nadu",
    country: "India",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=Fr.%20Lopez%20Hall%2C%20Colachel",
  },

  media: {
    invitation: {
      preview: "/images/invitation-card.webp",
      download: "/images/invitation-card.jpg",
      downloadName: "jinustan-sharon-invitation.jpg",
      alt: "Original reception invitation",
    },
    socialPreview: "/images/couple.webp",
    favicon: "/favicon.svg",
    gallery: [
      { src: "/images/gallery7.webp", alt: "Jinustan and Sharon, memory 1" },
      { src: "/images/gallery8.webp", alt: "Jinustan and Sharon, memory 2" },
      { src: "/images/gallery5.webp", alt: "Jinustan and Sharon, memory 3" },
      { src: "/images/gallery3.webp", alt: "Jinustan and Sharon, memory 4" },
      { src: "/images/gallery2.webp", alt: "Jinustan and Sharon, memory 5" },
      { src: "/images/gallery4.webp", alt: "Jinustan and Sharon, memory 6" },
      { src: "/images/gallery6.webp", alt: "Jinustan and Sharon, memory 7" },
    ],
  },

  links: {
    credit: {
      label: "Original invitation by GRWSURE Infotech ↗",
      url: "https://grwsureinfotech.in/",
    } as { label: string; url: string } | null,
  },

  zones: {
    couple: {
      title: "The couple",
      navLabel: "Couple",
      caption: "Meet us at the floral stage",
      chapter: "Meet us at the floral stage",
    },
    invitation: {
      title: "Your invitation",
      navLabel: "Invitation",
      caption: "A little letter of love",
      chapter: "Our original invitation, held here for you.",
    },
    moments: {
      title: "Our moments",
      navLabel: "Moments",
      caption: "Wander through our memories",
      chapter: "{count} memories. A little world of us.",
    },
    celebration: {
      title: "The celebration",
      navLabel: "Celebration",
      caption: "Save a date with forever",
      chapter: "Save a date with forever",
    },
    venue: {
      title: "Find the venue",
      navLabel: "Venue",
      caption: "We’ll see you in Colachel",
      chapter: "We’ll see you in Colachel",
    },
  } satisfies Record<
    Zone,
    { title: string; navLabel: string; caption: string; chapter: string }
  >,

  copy: {
    brandTagline: "TOGETHER IN HIS GRACE",
    intro: {
      eyebrow: "STEP INTO OUR CELEBRATION",
      headingLines: ["Come closer.", "Our forever"],
      headingEmphasis: "begins here.",
      messageLines: [
        "Follow the lights. Walk down the aisle.",
        "Discover a little piece of our story.",
      ],
      enter: "Walk into the celebration",
      loading: "Lighting the lanterns…",
    },
    chapter: {
      tourEyebrow: "A JOURNEY THROUGH OUR FOREVER",
      overviewEyebrow: "WELCOME, MAKE YOURSELF AT HOME",
      destinationEyebrow: "0{index} / A MOMENT TO DISCOVER",
      overviewTitle: "Follow your heart.",
      overviewBody: "Drag to look around. Tap a marker to come closer.",
    },
    help: {
      title: "Stay in the moment.",
      orbit: "Drag to look around your destination",
      zoom: "Scroll or pinch to move closer",
      travel: "Tap a marker to travel through the venue",
      gallery: "Use arrows to change the framed photo",
      keyboard:
        "Use the bottom menu for keyboard navigation. Escape returns to the aerial view.",
    },
    controls: {
      returnToOverview: "Return to reception overview",
      goldenHour: "Golden hour",
      evening: "Evening",
      switchToGoldenHour: "Switch to golden hour",
      switchToEvening: "Switch to evening",
      guidedTour: "Guided tour",
      pauseTour: "Pause tour",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      aerialOverview: "Aerial overview",
      showHelp: "Show navigation help",
      explore: "Explore",
      dockLabel: "Travel through the reception",
      visit: "Visit {title}",
      destinationControls: "{title} controls",
    },
    destinations: {
      momentsTitle: "A little more of us.",
      momentsProgress: "Memory {current} of {total} · {status}",
      momentsPlaying: "Let the memories unfold",
      momentsPaused: "Choose a photograph or use ← →",
      chooseMemory: "Choose a memory",
      viewMemory: "View memory {current} of {total}",
      previousPhoto: "Previous photograph",
      nextPhoto: "Next photograph",
      playMemories: "Play memories",
      pauseMemories: "Pause memories",
      invitationTitle: "A little letter of love.",
      invitationBody: "Your presence will make our celebration more special.",
      lookCloser: "Look closer",
      leaveCloseView: "Leave close view",
      keepInvitation: "Keep the invitation",
      saveDate: "Save the date",
      calendarDownloaded: "Calendar downloaded",
      celebrate: "Celebrate",
      getDirections: "Get directions",
    },
    status: {
      tour: "THE NEXT STOP IS JUST A MOMENT AWAY",
      evening: "AN EVENING TO REMEMBER",
      goldenHour: "IN THE GLOW OF GOLDEN HOUR",
    },
    footer: "AN IMAGINED GARDEN RECEPTION · REAL MEMORIES, REAL LOVE",
    overviewCelebration: "A little celebration",
    countdown: {
      labels: ["Days", "Hours", "Minutes", "Seconds"],
      complete: "The celebration has begun!",
    },
    fallback: {
      label: "Reception content",
      intro:
        "3D is unavailable on this device. Explore the original photos and details here.",
    },
    scripture: {
      quote:
        "They are the shoot I have planted, the work of my hands, for the display of my splendor.",
      citation: "Isaiah 60:21",
    },
  },

  scene: {
    stageSubtitle: "THE BEGINNING OF FOREVER",
    eventHeading: "A date with forever",
    venueHeading: "We’ll see you here",
    camera: {
      mobileBreakpointPx: 600,
    },
    invitationDisplay: {
      position: [4.8, 2.1, 10],
      angle: -0.28,
      width: 1.72,
      height: 3.06,
      cameraWidth: 2,
      cameraHeight: 3.5,
      supportOffset: 0.48,
      supportDepth: -0.16,
    },
    celebrationCard: {
      position: [6.15, 2.4, 1.35],
      angle: -0.78,
      width: 1.4,
      height: 1.65,
      cameraWidth: 1.95,
      cameraHeight: 2.05,
    },
    venueCard: {
      width: 2.8,
      height: 1.9,
      cameraWidth: 3.25,
      cameraHeight: 2.35,
    },
  },

  behavior: {
    galleryAutoplayMs: 5_500,
    guidedTourStopMs: 8_000,
  },

  seo: {
    language: "en",
    fallbackBaseUrl: "https://jinustan-sharon-reimagined.neonbloom64.chatgpt.site",
    titleSuffix: "The Beginning of Forever",
    socialTitleSuffix: "You’re Invited",
    description:
      "Join {names} for their {event} on {date}, {time}, at {venue}.",
    socialDescription: "{date} · {time} · {venue}",
  },

  theme: {
    /** CSS custom properties used by the interface theme layer. */
    css: {
      "--theme-font-serif": "'Cormorant Garamond', Georgia, serif",
      "--theme-font-sans": "'Manrope', Arial, sans-serif",
      "--theme-page-background": "#151e2b",
      "--theme-text": "#f6efdf",
      "--theme-muted": "#c9c8c2",
      "--theme-accent": "#e1c295",
      "--theme-accent-strong": "#b69c79",
      "--theme-night-overlay": "#101921",
      "--theme-day-overlay": "#34493b",
      "--theme-control": "#17251e",
      "--theme-control-hover": "#29382c",
      "--theme-control-text": "#dbd9ce",
      "--theme-primary-button": "#eadbc2",
      "--theme-primary-button-hover": "#fff0d7",
      "--theme-primary-button-text": "#26332e",
      "--theme-panel": "#f5f1e7",
      "--theme-panel-text": "#2b4536",
      "--theme-panel-muted": "#78816f",
      "--theme-panel-border": "#d5dacd",
      "--theme-panel-accent": "#9a8057",
      "--theme-focus": "#dfbd83",
      "--theme-white": "#ffffff",
      "--theme-black": "#000000",
    },

    /** Materials, lighting and sky colors used by the procedural 3D venue. */
    world: {
      background: "#151e2b",
      hemisphereSky: "#becbdf",
      hemisphereGround: "#817663",
      sunlight: "#ffdea8",
      rimLight: "#819fcd",
      warmLight: "#ffbe76",
      cream: "#eee3d0",
      ivory: "#fff0d9",
      gold: "#b39359",
      sage: "#536858",
      darkGreen: "#263f32",
      wood: "#80694f",
      rose: "#dcb4a7",
      stone: "#bdaf96",
      white: "#f6ecd9",
      glow: "#ffe9b4",
      glowEmissive: "#ffca70",
      grass: "#6b775d",
      glass: "#f2e7d2",
      curtain: "#e9dfcc",
      surfaceWood: "#8a755b",
      surfaceGrass: "#677456",
      surfaceStone: "#b9b4a6",
      surfaceLinen: "#c6c4bc",
      surfaceHighlight: "#ffffff20",
      floor: "#e5dcc9",
      floorGrid: "#cec4b0",
      stageTitle: "#9f7c42",
      stageSubtitle: "#627258",
      welcomeText: "#6b765c",
      boardBackground: "#f3ecdc",
      boardBorder: "#b59b70",
      boardHeading: "#9c8052",
      boardText: "#354d3e",
      stringLightWire: "#716650",
      diningLight: "#ffc883",
      flowers: ["#fff4df", "#e4bdb1", "#f3e6d6"],
      fireflies: "#ffdb94",
      confetti: "#edbd77",
      eveningSky: ["#071426", "#37465a", "#565655", "#19291f", "#0c1711"],
      goldenSky: ["#779fb2", "#f2c6a3", "#e9c4a2", "#87917a", "#405740"],
      eveningFog: "#344044",
      goldenFog: "#b8bca8",
      eveningSun: "#ffdcac",
      goldenSun: "#fff0d3",
      headingFont: "Georgia",
      bodyFont: "Georgia",
    },
  },
} as const;

const eventDate = new Date(invitationConfig.event.start);

if (Number.isNaN(eventDate.getTime())) {
  throw new Error("invitationConfig.event.start must be a valid ISO-8601 date");
}

const eventDateParts = new Intl.DateTimeFormat(invitationConfig.event.dateLocale, {
  timeZone: invitationConfig.event.timeZone,
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
}).formatToParts(eventDate);

const datePart = (type: Intl.DateTimeFormatPartTypes) =>
  eventDateParts.find((part) => part.type === type)?.value ?? "";

const weekday = datePart("weekday");
const day = datePart("day");
const month = datePart("month");
const year = datePart("year");
const monthNumber = new Intl.DateTimeFormat("en", {
  timeZone: invitationConfig.event.timeZone,
  month: "2-digit",
}).format(eventDate);
const time = new Intl.DateTimeFormat(invitationConfig.event.timeLocale, {
  timeZone: invitationConfig.event.timeZone,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}).format(eventDate);

export const eventDisplay = {
  dateLong: `${weekday}, ${day} ${month} ${year}`,
  date: `${day} ${month} ${year}`,
  dateUpper: `${day} ${month} ${year}`.toUpperCase(),
  dateShort: `${day}.${monthNumber}.${year.slice(-2)}`,
  dateBoard: `${day} · ${monthNumber} · ${year}`,
  time,
  timeWithZone: `${time} ${invitationConfig.event.timeZoneLabel}`,
  dateTimeWithZone: `${weekday}, ${day} ${month} ${year} · ${time} ${invitationConfig.event.timeZoneLabel}`,
  year,
} as const;

export const portraitPeople = [
  invitationConfig.people.together,
  ...invitationConfig.people.partners.map((person) => ({
    label: person.label,
    name: person.name,
    detail: [person.credentials, person.roles.join(" ")].join(" · "),
    image: person.image,
    alt: person.alt,
  })),
];

export const venueDisplay = {
  short: `${invitationConfig.venue.name}, ${invitationConfig.venue.locality}`,
  address: `${invitationConfig.venue.locality}, ${invitationConfig.venue.region}`,
  full: `${invitationConfig.venue.name}, ${invitationConfig.venue.locality}, ${invitationConfig.venue.region}, ${invitationConfig.venue.country}`,
} as const;

export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

const toCalendarUtc = (date: Date) =>
  date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escapeCalendarText = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");

const calendarEncoder = new TextEncoder();

const foldCalendarLine = (line: string) => {
  const folded: string[] = [];
  let current = "";
  let byteLimit = 75;

  for (const character of line) {
    if (calendarEncoder.encode(current + character).length > byteLimit) {
      folded.push(current);
      current = character;
      byteLimit = 74;
    } else {
      current += character;
    }
  }

  folded.push(current);
  return folded.join("\r\n ");
};

export function createCalendarContent(createdAt = new Date()) {
  const summary = `${invitationConfig.identity.displayName} — ${invitationConfig.event.title}`;
  const uidDate = toCalendarUtc(eventDate).replace("T", "-").replace("Z", "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Reusable 3D Event Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${invitationConfig.identity.slug}-${uidDate}@invitation`,
    `DTSTAMP:${toCalendarUtc(createdAt)}`,
    `DTSTART:${toCalendarUtc(eventDate)}`,
    `SUMMARY:${escapeCalendarText(summary)}`,
    `LOCATION:${escapeCalendarText(venueDisplay.full)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldCalendarLine)
    .join("\r\n");
}

export const invitationAssetPaths = [
  invitationConfig.people.together.image,
  ...invitationConfig.people.partners.map((person) => person.image),
  invitationConfig.media.invitation.preview,
  invitationConfig.media.invitation.download,
  invitationConfig.media.socialPreview,
  invitationConfig.media.favicon,
  ...invitationConfig.media.gallery.map((photo) => photo.src),
];
