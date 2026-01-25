"use client";

import { useState } from "react";
import Image from "next/image";
import { setPassword } from "../actions";

export default function CreatePasswordClient() {
    const [password, setPasswordInput] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (password.length < 6) {
                throw new Error("La contraseña debe tener al menos 6 caracteres.");
            }
            if (password !== confirm) {
                throw new Error("Las contraseñas no coinciden.");
            }

            const result = await setPassword(password);
            if (result?.error) {
                throw new Error(result.error);
            }
            // Redirect handled by action
        } catch (err: any) {
            setError(err.message || "Error al actualizar contraseña.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm md:max-w-md animate-fade-in flex flex-col items-center">
            {/* Logo */}
            <div className="mb-8 relative w-32 h-32 md:w-40 md:h-40">
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
                    Crea tu contraseña
                </h1>
                <p className="text-[#A0A0A0] text-sm md:text-base leading-relaxed">
                    Protege tu cuenta. Úsala para ingresar desde cualquier dispositivo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Confirmar Contraseña</label>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors"
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs text-center">
                        {error}
                    </div>
                )}

                {/* Checkboxes Legales */}
                {/* Legal Text (Clickwrap) */}
                <p className="text-xs text-[#A0A0A0] text-center mb-4 leading-relaxed px-2">
                    Al hacer clic aquí, aceptas los <a href="#" className="underline decoration-[#FF8A00]/50 hover:text-[#FF8A00]">Términos Comerciales de servicio de Stylernow</a>, y confirmas que has leído la <a href="#" className="underline decoration-[#FF8A00]/50 hover:text-[#FF8A00]">Política de privacidad para socios de Stylernow</a> para saber cómo se recopilan, se utilizan y se comparten tus datos.
                </p>

                <div className="flex flex-col gap-4 mt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#FF8A00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF8A00]/10"
                    >
                        {loading ? "Crear cuenta" : "Finalizar registro"}
                    </button>

                    <p className="text-[#A0A0A0] text-xs text-center px-4 leading-relaxed">
                        Importante: Tu email verificado y esta contraseña serán tus credenciales únicas para acceder al panel de gestión de tu negocio.
                    </p>
                </div>
            </form>
        </div>
    );
}
