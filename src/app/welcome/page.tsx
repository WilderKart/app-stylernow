"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IntentCard from "@/components/onboarding/IntentCard";

// Safe intent types for internal logic
type SignupIntent = "owner" | "client" | null;

export default function WelcomePage() {
    const router = useRouter();
    const [selectedIntent, setSelectedIntent] = useState<SignupIntent>(null);

    const handleContinue = () => {
        if (!selectedIntent) return;
        // We pass intent via URL for the next visual step (Onboarding), 
        // but remember: URL is NOT authority. Backend will validate content on signup.
        router.push(`/onboarding?intent=${selectedIntent}`);
    };

    return (
        <div className="min-h-screen bg-pure-black flex flex-col p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[30%] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Logo Section */}
            <header className="mt-8 md:mt-12 mb-6 md:mb-10 flex flex-col items-center relative z-10 transition-all duration-500">
                <div className="w-24 h-auto mb-4 md:w-32 lg:w-40">
                    <img
                        src="/images/logo-gold.png"
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
                        imageSrc="/images/pantalla3.jpg"
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
                    Continuar
                </button>
            </footer>
        </div>
    );
}
