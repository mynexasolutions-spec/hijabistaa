"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface MobileHeroCarouselProps {
  images?: string[];
  speed?: number;
}

export default function MobileHeroCarousel({
  images = [],
  speed = 1.20,
}: MobileHeroCarouselProps) {
  // Fallback high quality modest fashion images if images array is empty
  const defaultImages = [
    "/khimar-handwork.png",
    "/abaya-double-layer.png",
    "/model-cream-hijab.png",
    "/jilbab-blue.png",
    "/khimar-handwork-1.png",
    "/abaya-front-open.png",
    "/luxe-salwar-kameez.png",
    "/jilbab-black.png",
  ];

  const carouselImages = images.length > 0 ? images : defaultImages;

  // Triple the items so we can loop infinitely right-to-left without gaps
  const trackImages = useRef([...carouselImages, ...carouselImages, ...carouselImages, ...carouselImages]).current;

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isPausedRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  const [activeCenterIndex, setActiveCenterIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only wait for a few initial priority images to load, since lazy images won't load until visible
    if (loadedCount >= Math.min(trackImages.length, 3)) {
      setIsLoading(false);
    }
    
    // Safety fallback: if images fail or take too long, show carousel anyway after 3s
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [loadedCount, trackImages.length]);

  const getCardDimensions = () => {
    const isSm = isMounted && typeof window !== "undefined" && window.innerWidth >= 640;
    return {
      cardWidth: isSm ? 180 : 150,
      visualWidth: isSm ? 164 : 136,
      visualHeight: isSm ? 240 : 198,
    };
  };

  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const containerW =
        containerRef.current.offsetWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 390);
      const { cardWidth } = getCardDimensions();
      const totalCards = trackImages.length;
      const totalTrackWidth = totalCards * cardWidth;
      const singleSetWidth = carouselImages.length * cardWidth;

      // Move smoothly right-to-left (+pos moves rawX leftwards)
      if (!isDraggingRef.current && !isPausedRef.current) {
        posRef.current += speed;
      }

      // Wrap smoothly inside the cloned range
      if (singleSetWidth > 0 && posRef.current >= singleSetWidth * 2) {
        posRef.current -= singleSetWidth;
      } else if (singleSetWidth > 0 && posRef.current < 0) {
        posRef.current += singleSetWidth;
      }

      const containerCenter = containerW / 2;
      let closestIdx = 0;
      let minCenterDist = Infinity;

      cardRefs.current.forEach((cardEl, idx) => {
        if (!cardEl) return;

        const rawX = idx * cardWidth - posRef.current;
        let wrappedX = (rawX + cardWidth * 2) % totalTrackWidth;
        if (wrappedX < 0) wrappedX += totalTrackWidth;
        const cardLeft = wrappedX - cardWidth * 2;

        const cardCenter = cardLeft + cardWidth / 2;
        const distFromCenter = cardCenter - containerCenter;

        if (Math.abs(distFromCenter) < minCenterDist) {
          minCenterDist = Math.abs(distFromCenter);
          closestIdx = idx % carouselImages.length;
        }

        // Normalize distance: -1 is left edge, 0 is exact center, +1 is right edge
        const normDist = distFromCenter / (containerW * 0.44);
        const absDist = Math.abs(normDist);

        // Hide cards that are well off screen and set opacity to 0 to prevent any GPU compositing/shadow overlap bugs
        if (absDist > 1.32) {
          cardEl.style.visibility = "hidden";
          cardEl.style.opacity = "0";
          cardEl.style.transform = `translate3d(${cardLeft}px, 0px, -500px) scale(0.5)`;
          cardEl.style.zIndex = "0";
          cardEl.style.pointerEvents = "none";
          return;
        }
        cardEl.style.visibility = "visible";
        cardEl.style.pointerEvents = "auto";

        // 3D Coverflow / Ribbon Carousel UI Guide Best Practices
        // Left cards rotateY(+deg) inward, right cards rotateY(-deg) inward
        const rotateY = -normDist * 24;
        const scale = Math.max(0.80, 1.05 - absDist * 0.22);
        const translateY = absDist * 12;
        // Negative Z offset prevents rotated 3D planes from intersecting and stacking shadow/border slices
        const translateZ = -absDist * 120;
        const zIndex = Math.round((2 - absDist) * 15);
        const opacity = Math.max(0.35, 1 - absDist * 0.52);

        cardEl.style.transform = `translate3d(${cardLeft}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        cardEl.style.zIndex = zIndex.toString();
        cardEl.style.opacity = opacity.toString();
      });

      // Update active bullet indicator periodically without spamming state
      setActiveCenterIndex((prev) => (prev !== closestIdx ? closestIdx : prev));

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [carouselImages.length, trackImages.length, speed]);

  // Touch & Mouse Swipe Handlers for responsive mobile interaction
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startPosRef.current = posRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = startXRef.current - e.touches[0].clientX;
    posRef.current = startPosRef.current + deltaX * 1.55;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startPosRef.current = posRef.current;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = startXRef.current - e.clientX;
    posRef.current = startPosRef.current + deltaX * 1.55;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const { visualWidth, visualHeight } = getCardDimensions();

  return (
    <div className="block lg:hidden w-full my-4 sm:my-6 relative select-none min-h-[260px] sm:min-h-[300px]">
      {/* Loading Skeleton/Spinner */}
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center transition-opacity duration-500 bg-[#FAF6F0] rounded-2xl sm:rounded-3xl ${isLoading ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="w-10 h-10 border-4 border-[#7E3F35]/20 border-t-[#7E3F35] rounded-full animate-spin"></div>
      </div>

      <div className={`transition-opacity duration-700 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}>
        {/* Container wrapper with 3D perspective exact as Carousel UI guide */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            isPausedRef.current = false;
          }}
          onMouseEnter={() => (isPausedRef.current = true)}
          className="relative w-full h-[210px] sm:h-[260px] overflow-hidden -mx-2 sm:-mx-4 px-2 sm:px-4 cursor-grab active:cursor-grabbing"
          style={{ perspective: "1150px", transformStyle: "preserve-3d" }}
        >
          {/* Left & Right ambient fade edge masks for smooth studio look */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-[#FAF6F0] to-transparent z-30 opacity-90" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-[#FAF6F0] to-transparent z-30 opacity-90" />

          {/* Cards container */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {trackImages.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className="absolute top-2 left-0 transition-shadow duration-300 rounded-2xl sm:rounded-3xl overflow-hidden bg-cream-deep border-[3.5px] sm:border-[4px] border-white shadow-soft hover:shadow-card"
                style={{
                  width: `${visualWidth}px`,
                  height: `${visualHeight}px`,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={src}
                  alt={`Modest Fashion Look ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 180px, 220px"
                  className="object-cover object-top pointer-events-none"
                  priority={idx < 5}
                  onLoad={() => setLoadedCount((prev) => prev + 1)}
                />

                {/* Subtle shine / glass overlay on cards */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/15 opacity-60 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Subtle indicator dots exact like Carousel UI guide best practices */}
        <div className="flex items-center justify-center gap-1.5 mt-3 mb-2 sm:mt-3 sm:mb-3">
          {carouselImages.slice(0, Math.min(8, carouselImages.length)).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeCenterIndex
                  ? "w-5 bg-[#7E3F35]"
                  : "w-1.5 bg-[#7E3F35]/25"
                }`}
            />
          ))}
        </div>

        {/* Responsive interactive badge */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5 text-[#7E3F35] animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="text-[10px] sm:text-[11px] font-display font-semibold tracking-widest text-[#7E3F35] uppercase">
            Smooth Auto-Sliding &bull; Swipe to Explore
          </span>
        </div>
      </div>
    </div>
  );
}
