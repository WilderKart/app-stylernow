"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "../actions";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (otp.length < 6) {
                throw new Error("El código debe tener 6 dígitos.");
            }

            const result = await verifyEmail(email, otp);
            if (result && result.error) {
                throw new Error(result.error);
            }

            // Redirect happens in action
        } catch (err: any) {
            setError(err.message || "Código inválido o expirado.");
        } finally {
            setLoading(false);
        }
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
                    Verifica tu correo
                </h1>
                <p className="text-[#A0A0A0] text-sm md:text-base leading-relaxed">
                    Te enviamos un código a <span className="text-white font-medium">{email}</span> para confirmar que eres tú.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Código de Verificación (Email)</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-center text-2xl tracking-[0.5em] text-white placeholder-gray-700 focus:border-[#FF8A00] focus:outline-none transition-colors"
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
                        <span>✔️</span>
                        <span className="text-center">Vas muy bien, este paso solo toma unos segundos.</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full bg-[#FF8A00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF8A00]/10"
                    >
                        {loading ? "Verificando..." : "Verificar correo"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="text-white">Cargando...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
