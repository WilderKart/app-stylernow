"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GradientOverlay from "@/components/ui/GradientOverlay";

export interface OnboardingSlide {
    image: string;
    title: string;
    highlight: string;
    description: string;
}

interface OnboardingCarouselProps {
    slides: OnboardingSlide[];
    ctaText: string;
    onComplete: () => void;
    intent: "owner" | "client";
}

export default function OnboardingCarousel({ slides, ctaText, onComplete, intent }: OnboardingCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showButton, setShowButton] = useState(false);
    const router = useRouter();

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    useEffect(() => {
        setShowButton(false);

        const showTimer = setTimeout(() => {
            setShowButton(true);
        }, 9000);

        const advanceTimer = setTimeout(() => {
            handleNext();
        }, 12000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(advanceTimer);
        };
    }, [currentIndex, slides.length]); // Added dependency

    const currentSlide = slides[currentIndex];

    return (
        <div className="relative h-screen w-full bg-pure-black overflow-hidden flex flex-col font-sans">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`
               absolute inset-0 transition-opacity duration-1000 ease-in-out
               ${index === currentIndex ? "opacity-100" : "opacity-0"}
             `}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover grayscale"
                            priority={index === 0}
                        />
                        <GradientOverlay className="z-10 bg-gradient-to-t from-pure-black via-pure-black/80 to-transparent" />
                    </div>
                ))}
            </div>

            {/* Top Navigation (Progress Only) */}
            <div className="absolute top-0 w-full p-6 z-50 flex gap-2">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? "w-8 bg-[#FF8A00]" : "w-1.5 bg-gray-600/50"
                            }`}
                    />
                ))}
            </div>

            {/* Bottom Content Content */}
            <div className="relative z-20 mt-auto w-full p-8 pb-12 flex flex-col min-h-[30vh] justify-end">
                {/* Animated Text Container */}
                <div key={currentIndex} className="animate-fade-in mb-8">
                    <h2 className="text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
                        {currentSlide.title} <span className="text-[#FF8A00] block">{currentSlide.highlight}</span>
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-[90%]">
                        {currentSlide.description}
                    </p>
                </div>

                {/* Subtle Action Button - Corner Positioned */}
                <button
                    onClick={handleNext}
                    disabled={!showButton}
                    className={`
                        absolute bottom-8 right-6
                        flex items-center gap-2
                        text-white font-medium text-lg tracking-wide
                        transition-all duration-700 ease-out transform
                        ${showButton
                            ? "translate-y-0 opacity-100"
                            : "translate-y-8 opacity-0 pointer-events-none"}
                        hover:text-[#FF8A00]
                    `}
                >
                    <span>{currentIndex === slides.length - 1 ? ctaText : "Continuar"}</span>
                    {/* Simple Chevron Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#FF8A00]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
