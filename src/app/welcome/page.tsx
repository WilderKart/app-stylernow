"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import IntentCard from "@/components/onboarding/IntentCard";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";

// Safe intent types for internal logic
type SignupIntent = "owner" | "client" | null;

function WelcomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const [selectedIntent, setSelectedIntent] = useState<SignupIntent>(null);

    if (status === 'review') {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-between p-6 overflow-hidden relative">
                {/* Background Spotlights */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(255,138,0,0.3)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

                {/* 1. Header with Logo */}
                <div className="w-full flex justify-center pt-10 md:pt-14 relative z-10 mb-8 md:mb-12">
                    <div className="w-[50%] max-w-[240px] md:max-w-[280px]">
                        <img
                            src="/images/sn-logo.png"
                            alt="StylerNow"
                            className="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                        />
                    </div>
                </div>

                {/* 2. Main Content - Vertically centered */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto text-center">
                    {/* Icon */}
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-[#FF8A00]/20 blur-2xl rounded-full animate-pulse" />
                        <ShieldCheck
                            size={80}
                            className="text-[#FF8A00] relative z-10 animate-[pulse_3s_ease-in-out_infinite]"
                            strokeWidth={1}
                        />
                    </div>

                    {/* Typography */}
                    <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
                        Documentación Enviada
                    </h1>
                    <p className="text-[#888888] text-sm leading-relaxed px-4">
                        Tu solicitud ha entrado en nuestra cola prioritaria. Validaremos tus credenciales en breve.
                    </p>
                </div>

                {/* 3. Status Card */}
                <div className="w-full max-w-[320px] mb-8 md:mb-12 relative z-10">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col items-center gap-1 shadow-2xl">
                        <span className="text-[10px] text-gray-500 font-medium tracking-[0.2em] uppercase">
                            Estatus
                        </span>
                        <span className="text-[#FF8A00] font-bold text-sm tracking-widest uppercase glow-text">
                            En Revisión
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    const handleContinue = () => {
        if (!selectedIntent) return;

        if (selectedIntent === "owner") {
            router.push('/create-barbershop');
        } else {
            router.push(`/onboarding?intent=${selectedIntent}`);
        }
    };

    return (
        <div className="min-h-screen bg-pure-black flex flex-col p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[30%] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Logo Section */}
            <header className="mt-8 md:mt-12 mb-6 md:mb-10 flex flex-col items-center relative z-10 transition-all duration-500">
                <div className="w-24 h-auto mb-4 md:w-32 lg:w-40">
                    <img
                        src="/images/sn-logo.png"
                        alt="StylerNow Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
                <h2 className="text-white text-xl md:text-2xl font-bold tracking-[0.2em] md:tracking-[0.3em]">
                    STYLERNOW
                </h2>
            </header>

            <main className="flex-1 w-full max-w-md md:max-w-4xl lg:max-w-6xl mx-auto flex flex-col justify-center items-center relative z-10 px-4">
                {/* Title inside Main to keep it close to cards */}
                <div className="mb-8 md:mb-12 text-center w-full px-2">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-widest bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent whitespace-nowrap">
                        ELIGE TU PERFIL
                    </h1>
                </div>

                {/* Cards Container */}
                <div className="w-full flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 items-center justify-center">
                    <IntentCard
                        title="Soy Cliente"
                        imageSrc="/images/pantalla1.jpeg"
                        active={selectedIntent === "client"}
                        onClick={() => setSelectedIntent("client")}
                    />

                    <IntentCard
                        title="Soy Profesional"
                        imageSrc="/images/pantalla2.jpg"
                        active={selectedIntent === "owner"}
                        onClick={() => setSelectedIntent("owner")}
                    />
                </div>
            </main>

            <footer className="mb-8 md:mb-12 relative z-10 w-full max-w-md mx-auto px-4 mt-8">
                <button
                    onClick={handleContinue}
                    disabled={!selectedIntent}
                    className={`
            w-full py-4 md:py-5 rounded-full font-bold text-lg md:text-xl tracking-wide transition-all duration-300 uppercase shadow-lg
            ${selectedIntent
                            ? "bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }
          `}
                >
                    {selectedIntent === "owner" ? "Crear Barbería" : "Continuar"}
                </button>
            </footer>
        </div>
    );
}

export default function WelcomePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <WelcomeContent />
        </Suspense>
    );
}
