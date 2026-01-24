"use client";

import { useState } from "react";
import Image from "next/image";

export default function WhatsAppVerificationClient({ phone }: { phone: string }) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Call verifyWhatsApp Action
        // For now, visual mock as requested in Phase 1
        setTimeout(() => {
            setLoading(false);
            alert("Integración de WhatsApp Pendiente (Fase siguiente)");
        }, 1500);
    };

    return (
        <div className="w-full max-w-sm md:max-w-md animate-fade-in flex flex-col items-center">
            {/* Logo */}
            <div className="mb-6 relative w-20 h-20 md:w-24 md:h-24">
                <Image
                    src="/images/sn-logo.png"
                    alt="StylerNow"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Confirma tu WhatsApp
                </h1>
                <p className="text-[#A0A0A0] text-sm md:text-base leading-relaxed">
                    Te enviaremos un código a <span className="text-white font-medium">{phone}</span>.
                    Este número será tu canal principal de seguridad.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Código WhatsApp</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-center text-2xl tracking-[0.5em] text-white placeholder-gray-700 focus:border-[#4ADE80] focus:outline-none transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center gap-2 justify-center text-[#A0A0A0] text-xs">
                        <span>📱</span>
                        <span className="text-center">Usaremos este número para notificaciones de reservas.</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full bg-[#25D366] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#22c55e] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#25D366]/10"
                    >
                        {loading ? "Verificando..." : "Confirmar número"}
                    </button>
                </div>
            </form>
        </div>
    );
}
