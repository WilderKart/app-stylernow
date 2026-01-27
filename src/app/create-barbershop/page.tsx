"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startRegistration } from "./actions";

export default function CreateBarbershopCredentials() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPhoneNumber = (value: string) => {
        // Basic E.164 normalization preview for UI (User types, we format)
        // Remove non-numeric
        const cleaned = value.replace(/\D/g, "");
        setPhone(cleaned);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Validate inputs (Basic)
            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                throw new Error("Ingresa un email válido.");
            }
            if (phone.length < 10) {
                throw new Error("Ingresa un número de celular válido.");
            }

            // 2. Call Server Action
            const result = await startRegistration(email, phone);

            if (result.error) {
                throw new Error(result.error);
            }

            // 3. Redirect to Email Verification
            // Passing data via query params for the prototype phase (IDEALLY secure storage or server session)
            router.push(`/create-barbershop/verify-email?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);

        } catch (err: any) {
            setError(err.message || "Ocurrió un error. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm md:max-w-md animate-fade-in flex flex-col items-center">
            {/* Logo */}
            <div className="mb-8 relative w-24 h-24 md:w-32 md:h-32">
                <Image
                    src="/images/sn-logo.png"
                    alt="StylerNow"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Crea tu barbería
                </h1>
                <p className="text-[#A0A0A0] text-sm md:text-base leading-relaxed">
                    Empieza en minutos. Verificamos tu identidad para mantener una comunidad segura y profesional.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="barberia@ejemplo.com"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#E5CB67] focus:outline-none transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Teléfono móvil (WhatsApp)</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => formatPhoneNumber(e.target.value)}
                        placeholder="300 123 4567"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#E5CB67] focus:outline-none transition-colors"
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs text-center">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center gap-2 justify-center text-[#A0A0A0] text-xs">
                        <span className="text-center">Tus datos están protegidos. Nunca compartimos tu información.</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#E5CB67] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E5CB67]/10"
                    >
                        {loading ? "Procesando..." : "Enviar códigos de verificación"}
                    </button>
                </div>
            </form>
        </div>
    );
}
