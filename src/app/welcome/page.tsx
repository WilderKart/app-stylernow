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

            <header className="mt-8 mb-12 relative z-10">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Bienvenido a <span className="text-gold">StylerNow</span>
                </h1>
                <p className="text-gray-text text-lg">
                    ¿Cómo deseas ingresar hoy?
                </p>
            </header>

            <main className="flex-1 flex flex-col gap-4 relative z-10 w-full max-w-md mx-auto">
                <IntentCard
                    title="Soy Profesional"
                    description="Soy dueño de un negocio y quiero gestionar mi agenda, staff y clientes."
                    icon={<span className="text-2xl">💼</span>}
                    active={selectedIntent === "owner"}
                    onClick={() => setSelectedIntent("owner")}
                />

                <IntentCard
                    title="Soy Cliente"
                    description="Quiero reservar citas, descubrir barberías y cuidar mi estilo."
                    icon={<span className="text-2xl">👤</span>}
                    active={selectedIntent === "client"}
                    onClick={() => setSelectedIntent("client")}
                />
            </main>

            <footer className="mt-8 mb-6 relative z-10 w-full max-w-md mx-auto">
                <button
                    onClick={handleContinue}
                    disabled={!selectedIntent}
                    className={`
            w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300
            ${selectedIntent
                            ? "bg-gold text-pure-black shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:bg-gold-light transform hover:-translate-y-1"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }
          `}
                >
                    CONTINUAR
                </button>
            </footer>
        </div>
    );
}
