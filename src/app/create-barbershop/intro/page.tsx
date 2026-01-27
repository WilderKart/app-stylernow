"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function IntroPage() {
    const router = useRouter();

    return (
        <div className="absolute inset-0 w-full h-full">
            {/* Background Hero */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/intro-premium.png"
                    alt="Barber Professional"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            {/* Content Content - Positioned absolute to ensure it sits on top of bg but respects layout */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end pb-32 md:pb-40 animate-fade-in-up">
                <div className="max-w-md mx-auto px-6 text-center">
                    <span className="block text-[#E5CB67] text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-black drop-shadow-lg">
                        Professional Business Profile
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-2 drop-shadow-2xl">
                        Tu barbería,<br />
                        <span className="text-gray-300">al siguiente nivel.</span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base mt-4 max-w-xs mx-auto leading-relaxed drop-shadow-md">
                        Completa la información de tu negocio para activar tu presencia en StylerNow y recibir reservas hoy mismo.
                    </p>
                </div>
            </div>

            {/* Navigation Button (Local) */}
            <button
                type="button"
                onClick={() => router.push('/create-barbershop/business-info')}
                className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full bg-[#E5CB67] shadow-lg hover:scale-105 transition-transform z-[100] cursor-pointer"
            >
                <ArrowRight className="w-8 h-8 text-white" />
            </button>
        </div>
    );
}
