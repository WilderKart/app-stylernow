"use client";

import { useState } from "react";
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
    const router = useRouter();

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const currentSlide = slides[currentIndex];

    return (
        <div className="relative h-screen w-full bg-pure-black overflow-hidden flex flex-col">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`
               absolute inset-0 transition-opacity duration-700 ease-in-out
               ${index === currentIndex ? "opacity-100" : "opacity-0"}
             `}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover grayscale" // Strict B/W requirement
                            priority={index === 0}
                        />
                        {/* Strict Gradient Overlay */}
                        <GradientOverlay className="z-10" />
                    </div>
                ))}
            </div>

            {/* Top Navigation */}
            <div className="absolute top-0 w-full p-6 z-50 flex justify-between items-center">
                <div className="flex gap-2">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-gold" : "w-1.5 bg-gray-800"
                                }`}
                        />
                    ))}
                </div>
                <button
                    onClick={handleSkip}
                    className="text-gray-text text-sm font-medium hover:text-white transition-colors"
                >
                    Skip
                </button>
            </div>

            {/* Bottom Content Content */}
            <div className="relative z-20 mt-auto w-full p-8 pb-12 flex flex-col">
                {/* Animated Text Container */}
                <div key={currentIndex} className="animate-fade-in">
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                        {currentSlide.title} <span className="text-gold">{currentSlide.highlight}</span>
                    </h2>
                    <p className="text-gray-text text-base leading-relaxed mb-8">
                        {currentSlide.description}
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleNext}
                    className="w-full bg-gold text-pure-black py-4 rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:bg-gold-light transition-all transform hover:-translate-y-1"
                >
                    {currentIndex === slides.length - 1 ? ctaText : "CONTINUAR"}
                </button>
            </div>
        </div>
    );
}
