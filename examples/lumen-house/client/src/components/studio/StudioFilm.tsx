"use client";

// Design system reminder: Shared Satisium UI grammar — film is a client-facing story in a neutral rounded media shell. Autoplay remains muted and a single accessible Play/Pause action is the only visible media control.

import { siteTour } from "@/content/site";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

export function StudioFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => setIsPlaying(false));
      return;
    }

    video.pause();
  };

  return (
    <section
      aria-labelledby="studio-film-heading"
      className="rounded-[1.4rem] bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <div className="max-w-md">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {siteTour.eyebrow}
          </p>
          <h2
            id="studio-film-heading"
            className="mt-5 text-balance font-sans text-4xl font-extrabold leading-[0.95] tracking-[-0.055em] text-foreground sm:text-5xl"
          >
            {siteTour.title}
          </h2>
          <p className="mt-5 font-sans text-sm leading-6 text-muted-foreground sm:text-base">
            {siteTour.copy}
          </p>
          <p className="mt-7 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            {siteTour.durationLabel}
          </p>
        </div>
        <figure className="overflow-hidden rounded-[1.4rem] border border-border bg-muted p-1.5 shadow-sm">
          <div className="relative overflow-hidden rounded-[1.1rem] bg-foreground">
            <video
              ref={videoRef}
              className="aspect-video w-full object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster={siteTour.poster}
              aria-describedby="studio-film-description"
              tabIndex={-1}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={siteTour.src} type="video/mp4" />
              This film is unavailable.
            </video>
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause film" : "Play film"}
              aria-pressed={isPlaying}
              className="absolute right-4 bottom-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-foreground/85 px-4 font-mono text-[10px] tracking-[0.1em] text-white uppercase shadow-lg backdrop-blur-sm outline-offset-2 transition-colors hover:bg-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              {isPlaying ? (
                <Pause aria-hidden="true" className="size-3" />
              ) : (
                <Play aria-hidden="true" className="size-3" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
          <figcaption
            id="studio-film-description"
            className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase sm:px-4"
          >
            <span>{siteTour.caption}</span>
            <span>{siteTour.duration}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
