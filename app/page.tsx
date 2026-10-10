"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Compass,
  Download,
  Heart,
  Image as ImageIcon,
  Mail,
  MapPin,
  Minus,
  Moon,
  MousePointer2,
  PartyPopper,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import {
  createCalendarContent,
  eventDisplay,
  fillTemplate,
  invitationConfig,
  portraitPeople,
  venueDisplay,
  zoneOrder,
  type View,
  type Zone,
} from "./invitation-config";
import type { World } from "./wedding-world";

const zoneIcons: Record<Zone, LucideIcon> = {
  couple: Heart,
  invitation: Mail,
  moments: ImageIcon,
  celebration: CalendarDays,
  venue: MapPin,
};

const zones = zoneOrder.map((id) => ({
  id,
  ...invitationConfig.zones[id],
  icon: zoneIcons[id],
}));

const gallery = invitationConfig.media.gallery;
const galleryTotal = gallery.length;
const eventStart = new Date(invitationConfig.event.start).getTime();
const { copy } = invitationConfig;

const padded = (value: number) => String(value).padStart(2, "0");

function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, eventStart - Date.now()));
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, []);

  const units =
    remaining === null
      ? [null, null, null, null]
      : [
          Math.floor(remaining / 86_400_000),
          Math.floor(remaining / 3_600_000) % 24,
          Math.floor(remaining / 60_000) % 60,
          Math.floor(remaining / 1_000) % 60,
        ];

  return (
    <>
      <div className="sheet-countdown">
        {units.map((value, index) => (
          <div key={copy.countdown.labels[index]}>
            <strong>{value === null ? "—" : padded(value)}</strong>
            <small>{copy.countdown.labels[index]}</small>
          </div>
        ))}
      </div>
      {remaining === 0 && <p>{copy.countdown.complete}</p>}
    </>
  );
}

function downloadCalendar() {
  const url = URL.createObjectURL(
    new Blob([createCalendarContent()], { type: "text/calendar;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${invitationConfig.identity.slug}.ics`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export default function Home() {
  const filmstrip = useRef<HTMLDivElement>(null);
  const photoRef = useRef(0);
  const playbackTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<World | null>(null);
  const hotspots = useRef<Record<string, HTMLButtonElement | null>>({});
  const tourTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [entered, setEntered] = useState(false);
  const [night, setNight] = useState(true);
  const [view, setView] = useState<View>("overview");
  const [tour, setTour] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [portrait, setPortrait] = useState(0);
  const [help, setHelp] = useState(false);
  const [reading, setReading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const actions = useRef<{
    select: (zone: Zone) => void;
    interact: () => void;
    step: (delta: number) => void;
    home: () => void;
  }>({
    select: () => {},
    interact: () => {},
    step: () => {},
    home: () => {},
  });

  const stopPlayback = () => {
    if (playbackTimer.current) clearInterval(playbackTimer.current);
    playbackTimer.current = null;
    setPlaying(false);
  };

  const stopTour = () => {
    if (tourTimer.current) clearInterval(tourTimer.current);
    tourTimer.current = null;
    setTour(false);
  };

  const travel = (zone: View) => {
    stopTour();
    stopPlayback();
    setEntered(true);
    setView(zone);
    setReading(false);
    world.current?.flyTo(zone);
    if (zone === "couple") setPortrait(0);
  };

  useEffect(() => {
    let disposed = false;
    let instance: World | null = null;

    import("./wedding-world")
      .then(({ createWorld }) => {
        if (disposed || !host.current) return;
        try {
          instance = createWorld(host.current, {
            reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
            onSelect: (zone) => actions.current.select(zone),
            onPhotoStep: (delta) => actions.current.step(delta),
            onInteraction: () => actions.current.interact(),
            onReady: () => setReady(true),
            onProject: (positions) => {
              for (const [id, position] of Object.entries(positions)) {
                const element = hotspots.current[id];
                if (element) {
                  element.style.transform = `translate(${position.x}px,${position.y}px)`;
                  element.style.visibility = position.visible ? "visible" : "hidden";
                }
              }
            },
          });
          world.current = instance;
        } catch {
          setFailed(true);
          setReady(true);
        }
      })
      .catch(() => {
        setFailed(true);
        setReady(true);
      });

    return () => {
      disposed = true;
      instance?.destroy();
      world.current = null;
      if (tourTimer.current) clearInterval(tourTimer.current);
      if (playbackTimer.current) clearInterval(playbackTimer.current);
    };
  }, []);

  useEffect(() => {
    world.current?.setNight(night);
  }, [night, ready]);

  const selectPhoto = (index: number, manual = true) => {
    stopTour();
    if (manual) stopPlayback();
    const next = (index + galleryTotal) % galleryTotal;
    photoRef.current = next;
    setPhoto(next);
    world.current?.showPhoto(next);
  };

  const changePhoto = (delta: number) => selectPhoto(photoRef.current + delta);

  const togglePlayback = () => {
    if (playing) {
      stopPlayback();
      return;
    }
    stopTour();
    setPlaying(true);
    playbackTimer.current = setInterval(() => {
      if (!document.hidden) selectPhoto(photoRef.current + 1, false);
    }, invitationConfig.behavior.galleryAutoplayMs);
  };

  useEffect(() => {
    actions.current = {
      select: (zone) => travel(zone),
      interact: () => {
        stopTour();
        stopPlayback();
      },
      step: changePhoto,
      home: () => travel("overview"),
    };
  });

  useEffect(() => {
    const strip = filmstrip.current;
    const active = strip?.children[photo] as HTMLElement | undefined;
    if (strip && active) {
      strip.scrollTo({
        left:
          active.offsetLeft -
          strip.offsetLeft -
          strip.clientWidth / 2 +
          active.clientWidth / 2,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [photo, view]);

  const choosePortrait = (index: number) => {
    stopTour();
    setPortrait(index);
    setReading(false);
    world.current?.showPortrait(index);
  };

  const inspect = () => {
    stopTour();
    stopPlayback();
    world.current?.zoom(reading ? 1 / 0.76 : 0.76);
    setReading(!reading);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.matches("input,textarea,select,[contenteditable=true]")
      ) {
        return;
      }
      if (event.key === "Escape") actions.current.home();
      if (
        view === "moments" &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        actions.current.step(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [view]);

  const startTour = () => {
    stopPlayback();
    if (tour) {
      stopTour();
      return;
    }
    stopTour();
    setEntered(true);
    setReading(false);
    setTour(true);
    let index = 0;
    const visit = () => {
      const id = zoneOrder[index % zoneOrder.length];
      setView(id);
      if (id === "couple") setPortrait(0);
      world.current?.flyTo(id);
      index += 1;
    };
    visit();
    tourTimer.current = setInterval(
      visit,
      invitationConfig.behavior.guidedTourStopMs,
    );
  };

  const enter = () => {
    setEntered(true);
    setView("overview");
    world.current?.enter();
  };

  const activeZone = view === "overview" ? null : invitationConfig.zones[view];
  const zoneIndex = view === "overview" ? 0 : zoneOrder.indexOf(view) + 1;
  const chapterEyebrow = tour
    ? copy.chapter.tourEyebrow
    : view === "overview"
      ? copy.chapter.overviewEyebrow
      : fillTemplate(copy.chapter.destinationEyebrow, { index: zoneIndex });
  const chapterTitle =
    view === "overview" ? copy.chapter.overviewTitle : activeZone?.title;
  const chapterBody =
    view === "overview"
      ? copy.chapter.overviewBody
      : view === "moments"
        ? fillTemplate(invitationConfig.zones.moments.chapter, {
            count: galleryTotal,
          })
        : activeZone?.chapter;
  const memoryProgress = fillTemplate(copy.destinations.momentsProgress, {
    current: padded(photo + 1),
    total: padded(galleryTotal),
    status: playing
      ? copy.destinations.momentsPlaying
      : copy.destinations.momentsPaused,
  });

  return (
    <main
      className={`experience spatial-experience ${entered ? "has-entered" : ""} ${night ? "is-night" : "is-day"} ${failed ? "world-fallback" : ""} ${reading ? "is-reading" : ""} ${view !== "overview" ? "has-destination" : ""} ${view === "moments" ? "is-moments" : ""} ${view === "celebration" ? "is-celebration" : ""}`}
    >
      <div className="world-canvas" ref={host} />
      <div className="world-vignette" />

      <header className="world-header">
        <button
          className="world-brand"
          aria-label={copy.controls.returnToOverview}
          onClick={() => travel("overview")}
        >
          {invitationConfig.identity.initials[0]}
          <span>{invitationConfig.identity.connector}</span>
          {invitationConfig.identity.initials[1]}
          <i>{eventDisplay.dateShort}</i>
        </button>
        <span className="world-header-note">{copy.brandTagline}</span>
        <div className="world-header-actions">
          <button
            onClick={() => setNight(!night)}
            aria-label={
              night
                ? copy.controls.switchToGoldenHour
                : copy.controls.switchToEvening
            }
            aria-pressed={!night}
          >
            {night ? <Sun size={16} /> : <Moon size={16} />}
            <span>
              {night ? copy.controls.goldenHour : copy.controls.evening}
            </span>
          </button>
          <button
            onClick={startTour}
            disabled={!ready || failed}
            aria-pressed={tour}
            aria-label={
              tour ? copy.controls.pauseTour : copy.controls.guidedTour
            }
          >
            {tour ? <Pause size={15} /> : <Play size={15} />}
            <span>
              {tour ? copy.controls.pauseTour : copy.controls.guidedTour}
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {!entered && (
          <motion.div
            className="world-intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="world-eyebrow">
              <span />
              {copy.intro.eyebrow}
            </div>
            <h1>
              {copy.intro.headingLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
              <em>{copy.intro.headingEmphasis}</em>
            </h1>
            <p className="intro-names">
              {invitationConfig.identity.firstNames[0]}{" "}
              <span>{invitationConfig.identity.connector}</span>{" "}
              {invitationConfig.identity.firstNames[1]}
            </p>
            <p className="intro-message">
              {copy.intro.messageLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < copy.intro.messageLines.length - 1 && <br />}
                </span>
              ))}
            </p>
            <button className="enter-world" disabled={!ready} onClick={enter}>
              <span>{ready ? copy.intro.enter : copy.intro.loading}</span>
              {ready ? (
                <ArrowUpRight size={20} />
              ) : (
                <span className="loading-ring" />
              )}
            </button>
            <span className="intro-date">
              {eventDisplay.dateUpper}
              <i />
              {eventDisplay.time} · {invitationConfig.venue.locality.toUpperCase()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {entered && (
        <motion.div
          className="world-chapter"
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="world-eyebrow">{chapterEyebrow}</span>
          <h2>{chapterTitle}</h2>
          <p>{chapterBody}</p>
        </motion.div>
      )}

      <div
        className={`hotspot-layer ${entered && ready && !failed && !reading ? "show-hotspots" : ""}`}
      >
        {zones
          .filter((zone) => view === "overview" || zone.id !== view)
          .map(({ id, title, icon: Icon }) => (
            <button
              key={id}
              className="world-hotspot"
              ref={(element) => {
                hotspots.current[id] = element;
              }}
              aria-label={fillTemplate(copy.controls.visit, { title })}
              onClick={() => travel(id)}
              tabIndex={entered && !reading ? 0 : -1}
            >
              <span className="hotspot-pulse" />
              <span className="hotspot-dot">
                <Icon size={15} />
              </span>
              <span className="hotspot-label">
                {title}
                <ArrowUpRight size={12} />
              </span>
            </button>
          ))}
      </div>

      <div className="world-side-controls">
        <button
          aria-label={copy.controls.zoomIn}
          disabled={!ready || failed}
          onClick={() => world.current?.zoom(0.85)}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label={copy.controls.zoomOut}
          disabled={!ready || failed}
          onClick={() => world.current?.zoom(1.15)}
        >
          <Minus size={18} />
        </button>
        <span />
        <button
          aria-label={copy.controls.aerialOverview}
          disabled={!ready || failed}
          onClick={() => travel("overview")}
        >
          <RotateCcw size={17} />
        </button>
        <button
          aria-label={copy.controls.showHelp}
          aria-expanded={help}
          onClick={() => setHelp(!help)}
        >
          <MousePointer2 size={17} />
        </button>
      </div>

      <AnimatePresence>
        {help && (
          <motion.div
            className="world-help"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <strong>{copy.help.title}</strong>
            <p>
              <MousePointer2 size={16} />
              {copy.help.orbit}
            </p>
            <p>
              <ZoomIn size={16} />
              {copy.help.zoom}
            </p>
            <p>
              <Sparkles size={16} />
              {copy.help.travel}
            </p>
            <p>
              <ImageIcon size={16} />
              {copy.help.gallery}
            </p>
            <small>{copy.help.keyboard}</small>
          </motion.div>
        )}
      </AnimatePresence>

      {entered && view !== "overview" && (
        <section
          className="destination-controls"
          aria-label={fillTemplate(copy.controls.destinationControls, {
            title: activeZone?.title ?? view,
          })}
        >
          <div className="destination-caption" aria-live="polite">
            {view === "couple" && (
              <>
                <strong>{portraitPeople[portrait].name}</strong>
                <span>{portraitPeople[portrait].detail}</span>
              </>
            )}
            {view === "moments" && (
              <>
                <strong>{copy.destinations.momentsTitle}</strong>
                <span>{memoryProgress}</span>
              </>
            )}
            {view === "invitation" && (
              <>
                <strong>{copy.destinations.invitationTitle}</strong>
                <span>{copy.destinations.invitationBody}</span>
              </>
            )}
            {view === "celebration" && (
              <>
                <strong>{eventDisplay.dateTimeWithZone}</strong>
                <span>
                  {venueDisplay.short}
                  {saved && ` · ${copy.destinations.calendarDownloaded}`}
                </span>
              </>
            )}
            {view === "venue" && (
              <>
                <strong>{invitationConfig.venue.name}</strong>
                <span>{venueDisplay.address}</span>
              </>
            )}
          </div>

          {view === "moments" && (
            <div
              className="moments-filmstrip"
              ref={filmstrip}
              role="group"
              aria-label={copy.destinations.chooseMemory}
            >
              {gallery.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  className={photo === index ? "active" : ""}
                  onClick={() => selectPhoto(index)}
                  aria-label={fillTemplate(copy.destinations.viewMemory, {
                    current: index + 1,
                    total: galleryTotal,
                  })}
                  aria-pressed={photo === index}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={96}
                    height={108}
                    loading="lazy"
                    draggable={false}
                  />
                  <span>{padded(index + 1)}</span>
                </button>
              ))}
            </div>
          )}

          <div className="destination-actions">
            {view === "couple" &&
              portraitPeople.map((person, index) => (
                <button
                  key={person.name}
                  className={portrait === index ? "selected" : ""}
                  onClick={() => choosePortrait(index)}
                  aria-pressed={portrait === index}
                >
                  {person.label}
                </button>
              ))}
            {view === "moments" && (
              <>
                <button
                  onClick={() => changePhoto(-1)}
                  aria-label={copy.destinations.previousPhoto}
                >
                  <ArrowLeft size={18} />
                </button>
                <span className="photo-counter">
                  {padded(photo + 1)} / {padded(galleryTotal)}
                </span>
                <button
                  onClick={() => changePhoto(1)}
                  aria-label={copy.destinations.nextPhoto}
                >
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={togglePlayback}
                  aria-label={
                    playing
                      ? copy.destinations.pauseMemories
                      : copy.destinations.playMemories
                  }
                  aria-pressed={playing}
                >
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </>
            )}
            {(view === "moments" || view === "invitation") && (
              <button onClick={inspect} aria-pressed={reading}>
                <ZoomIn size={16} />
                <span>
                  {reading
                    ? copy.destinations.leaveCloseView
                    : copy.destinations.lookCloser}
                </span>
              </button>
            )}
            {view === "invitation" && (
              <a
                href={invitationConfig.media.invitation.download}
                download={invitationConfig.media.invitation.downloadName}
              >
                <Download size={16} />
                <span>{copy.destinations.keepInvitation}</span>
              </a>
            )}
            {view === "celebration" && (
              <>
                <button
                  onClick={() => {
                    downloadCalendar();
                    setSaved(true);
                  }}
                >
                  <CalendarDays size={16} />
                  <span>{copy.destinations.saveDate}</span>
                </button>
                <button
                  onClick={() => {
                    travel("couple");
                    world.current?.celebrate();
                  }}
                >
                  <PartyPopper size={16} />
                  <span>{copy.destinations.celebrate}</span>
                </button>
              </>
            )}
            {view === "venue" && (
              <a
                href={invitationConfig.venue.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={16} />
                <span>{copy.destinations.getDirections}</span>
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </section>
      )}

      <div className="world-bottom">
        <div className="world-status">
          <span className="status-dot" />
          {tour
            ? copy.status.tour
            : night
              ? copy.status.evening
              : copy.status.goldenHour}
        </div>
        <nav className="world-dock" aria-label={copy.controls.dockLabel}>
          <button
            className={view === "overview" ? "active" : ""}
            onClick={() => travel("overview")}
            disabled={!ready}
            aria-current={view === "overview" ? "page" : undefined}
          >
            <Compass size={18} />
            <span>{copy.controls.explore}</span>
          </button>
          {zones.map(({ id, navLabel, icon: Icon }) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => travel(id)}
              disabled={!ready}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{navLabel}</span>
            </button>
          ))}
        </nav>
        <div className="world-caption">
          {copy.footer}{" "}
          {invitationConfig.links.credit && (
            <a
              href={invitationConfig.links.credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="original-credit"
            >
              {invitationConfig.links.credit.label}
            </a>
          )}
        </div>
      </div>

      {entered && view === "overview" && !failed && (
        <button
          className="celebrate-button"
          onClick={() => {
            travel("couple");
            world.current?.celebrate();
          }}
        >
          <PartyPopper size={17} />
          {copy.overviewCelebration}
        </button>
      )}

      <div className="sr-content">
        <h2>{invitationConfig.identity.fullNames}</h2>
        <p>
          {invitationConfig.event.title}: {eventDisplay.dateLong},{" "}
          {eventDisplay.timeWithZone}. {venueDisplay.full}.
        </p>
        {invitationConfig.people.partners.map((person) => (
          <p key={person.name}>
            {person.name}, {person.credentials}, {person.roles.join(" ")}.
          </p>
        ))}
        <p>
          {copy.scripture.quote} {copy.scripture.citation}.
        </p>
      </div>

      {failed && entered && (
        <section className="fallback-content" aria-label={copy.fallback.label}>
          <p>{copy.fallback.intro}</p>
          {view === "couple" || view === "overview" ? (
            <Image
              src={portraitPeople[portrait].image}
              alt={portraitPeople[portrait].alt}
              width={900}
              height={1_200}
            />
          ) : view === "moments" ? (
            <Image
              src={gallery[photo].src}
              alt={gallery[photo].alt}
              width={1_200}
              height={1_200}
            />
          ) : view === "invitation" ? (
            <Image
              src={invitationConfig.media.invitation.preview}
              alt={invitationConfig.media.invitation.alt}
              width={900}
              height={1_600}
            />
          ) : (
            <>
              <h2>
                {view === "venue"
                  ? invitationConfig.venue.name
                  : eventDisplay.date}
              </h2>
              <p>
                {eventDisplay.timeWithZone} · {venueDisplay.address}
              </p>
              <Countdown />
            </>
          )}
        </section>
      )}
    </main>
  );
}
