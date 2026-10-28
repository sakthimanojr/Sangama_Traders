"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  video: string;
  poster: string;
  slides: string[];
  intervalMs?: number;
  // Overlays and hero text. They are server-rendered and always visible, on top of the background.
  children: ReactNode;
};

// poster  first paint, before we know whether to play the video
// video   the video plays once behind the hero text
// slides  the video has ended (or was skipped): a blurred slideshow is the background
type Phase = "poster" | "video" | "slides";

type NetworkInformation = { saveData?: boolean };

export function HeroStage({ video, poster, slides, intervalMs = 6000, children }: Props) {
  const [phase, setPhase] = useState<Phase>("poster");
  const [slidesIn, setSlidesIn] = useState(false);
  const [videoMounted, setVideoMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Decide once, after load, whether this visitor gets the video.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const saveData = connection?.saveData === true;
    setReducedMotion(reduce);
    if (wide && !reduce && !saveData) {
      setVideoMounted(true);
      setPhase("video");
    } else {
      setPhase("slides");
    }
  }, []);

  // Start the video. If autoplay is blocked or the video stalls, go to the slideshow.
  useEffect(() => {
    if (phase !== "video") return;
    videoRef.current?.play().catch(() => setPhase("slides"));
    const safety = window.setTimeout(() => setPhase("slides"), 12000);
    return () => window.clearTimeout(safety);
  }, [phase]);

  // When the slideshow starts, fade it in, then remove the finished video.
  useEffect(() => {
    if (phase !== "slides") return;
    const fadeIn = window.setTimeout(() => setSlidesIn(true), 30);
    const removeVideo = window.setTimeout(() => setVideoMounted(false), 1800);
    return () => {
      window.clearTimeout(fadeIn);
      window.clearTimeout(removeVideo);
    };
  }, [phase]);

  useEffect(() => {
    setReached((current) => Math.max(current, index));
  }, [index]);

  // Advance the slideshow.
  useEffect(() => {
    if (phase !== "slides" || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [phase, reducedMotion, slides.length, intervalMs]);

  // Only load the current slide and the next one, so the page stays light.
  const loadedSlides = slides.slice(0, Math.min(reached + 2, slides.length));

  return (
    <div data-phase={phase} className="relative isolate overflow-hidden rounded-3xl text-white">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-deep-navy">
        {/* Poster: the first frame of the video, so there is never an empty background. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" width={1280} height={720} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />

        {phase === "slides" ? (
          <div
            className={`absolute inset-0 transition-opacity duration-[1500ms] motion-reduce:transition-none ${
              slidesIn ? "opacity-100" : "opacity-0"
            }`}
          >
            {loadedSlides.map((src, position) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                width={1600}
                height={900}
                loading={position === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full scale-110 object-cover object-bottom blur-sm transition-opacity duration-[1600ms] motion-reduce:transition-none ${
                  position === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        ) : null}

        {videoMounted ? (
          <video
            ref={videoRef}
            src={video}
            poster={poster}
            muted
            playsInline
            preload="auto"
            onEnded={() => setPhase("slides")}
            onError={() => setPhase("slides")}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1500ms] motion-reduce:transition-none ${
              phase === "slides" ? "scale-105 opacity-0 blur-xl" : "opacity-100 blur-0"
            }`}
          />
        ) : null}
      </div>

      {children}
    </div>
  );
}
