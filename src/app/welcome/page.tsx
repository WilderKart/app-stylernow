"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import IntentCard from "@/components/onboarding/IntentCard";
import { Suspense } from "react";

// Safe intent types for internal logic
type SignupIntent = "owner" | "client" | null;

function WelcomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const [selectedIntent, setSelectedIntent] = useState<SignupIntent>(null);

    if (status === 'review') {
        return (
            <div className="min-h-screen bg-pure-black flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[40%] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="w-24 h-24 bg-[#FF8A00]/10 rounded-full flex items-center justify-center mb-6 border border-[#FF8A00]/20">
                    <span className="text-4xl">🚀</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">¡Solicitud Recibida!</h1>
                <p className="text-[#A0A0A0] max-w-md leading-relaxed mb-8">
                    Hemos recibido tus documentos. Nuestro equipo verificará tu información en las próximas 24 horas.
                    <br /><br />
                    Te notificaremos por WhatsApp cuando tu barbería esté activa.
                </p>
                <div className="p-4 bg-[#121212] border border-gray-800 rounded-xl w-full max-w-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Estado Actual</p>
                    <p className="text-[#FF8A00] font-bold">En Revisión (Pending)</p>
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
