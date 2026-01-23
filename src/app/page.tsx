"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "700",
});

export default function SplashPage() {
  const router = useRouter();
  const [fading, setFading] = useState(false);

  // Swipe handling state
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const navigateToWelcome = () => {
    setFading(true);
    setTimeout(() => router.push("/welcome"), 500);
  };

  useEffect(() => {
    // Timeout extended to 10 seconds as requested
    const autoNavTimer = setTimeout(() => {
      navigateToWelcome();
    }, 20000);

    return () => clearTimeout(autoNavTimer);
  }, [router]);

  // Handle Touch Gestures for Swipe Left/Right
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;

    // Allow swipe left (normal for "next") or tap to continue logic if desired, keeping clear swipe for now
    if (isLeftSwipe) {
      navigateToWelcome();
    }
  };

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-black
        transition-opacity duration-1000 ease-in-out
        ${fading ? "opacity-0" : "opacity-100"}
      `}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Image - Centered vertically and horizontally */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Image
          src="/images/splash-bg.png"
          alt="Splash Background"
          fill
          className="object-contain" // Centered and contained
          priority
        />
        {/* No overlay needed if we want 'tal cual' in a black void */}
      </div>

      {/* CLEAN INTERFACE - Logo/Title Removed */}

      <div className={`absolute bottom-6 z-30 w-full text-center ${lexend.className}`}>
        <p className="text-sm font-bold tracking-widest uppercase">
          <span className="text-white">Powered by</span> <span className="text-[#D4AF37]">Stylernow</span>
        </p>
      </div>

      {/* Heartbeat Action Button (Right Side) */}
      <button
        onClick={navigateToWelcome}
        className="absolute bottom-20 right-6 z-50 group"
        aria-label="Continuar"
      >
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full border border-gold/30 bg-black/40 backdrop-blur-sm transition-all duration-300 group-hover:bg-gold/10 group-hover:border-gold">
          {/* Heartbeat Pulse Effect - CSS Keyframe is cleanest for specific "heartbeat" */}
          <div className="absolute inset-0 rounded-full border border-gold/50 opacity-0 group-hover:opacity-100" style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />

          {/* Arrow Icon with Heartbeat Scaling */}
          <svg
            className="w-6 h-6 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ animation: 'heartbeat 1.5s ease-in-out infinite' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <style jsx>{`
          @keyframes heartbeat {
            0% { transform: scale(1); }
            14% { transform: scale(1.15); }
            28% { transform: scale(1); }
            42% { transform: scale(1.15); }
            70% { transform: scale(1); }
          }
        `}</style>
      </button>
    </div>
  );
}
