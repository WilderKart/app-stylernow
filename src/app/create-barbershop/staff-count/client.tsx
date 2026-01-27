"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveStaffCount } from "../actions";
import { Users, Minus, Plus } from "lucide-react";

export default function StaffCountClient({ initialCount }: { initialCount: number }) {
    const router = useRouter();
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const increment = () => {
        if (count < 50) setCount(prev => prev + 1);
    };

    const decrement = () => {
        if (count > 1) setCount(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await saveStaffCount(count);
            if (result?.error) {
                throw new Error(result.error);
            }
            router.push('/create-barbershop/documents');
        } catch (err: any) {
            setError(err.message || "Error al guardaro.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm md:max-w-md animate-fade-in flex flex-col items-center pb-20">
            {/* Steps */}
            <div className="flex gap-2 mb-6">
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-8 h-1 bg-[#E5CB67] rounded-full"></div>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Tu Equipo
                </h1>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                    ¿Cuántos profesionales (incluyéndote) trabajan en el negocio?
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-10">

                {/* Counter */}
                <div className="flex items-center gap-8">
                    <button
                        type="button"
                        onClick={decrement}
                        className="w-16 h-16 rounded-full bg-[#1A1A1A] border border-gray-700 flex items-center justify-center text-white hover:border-[#E5CB67] hover:text-[#E5CB67] transition-colors active:scale-95"
                    >
                        <Minus size={32} />
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-6xl font-bold text-white tracking-tighter">{count}</span>
                        <span className="text-gray-500 text-sm uppercase tracking-widest mt-2">{count === 1 ? 'Persona' : 'Personas'}</span>
                    </div>

                    <button
                        type="button"
                        onClick={increment}
                        className="w-16 h-16 rounded-full bg-[#1A1A1A] border border-gray-700 flex items-center justify-center text-white hover:border-[#E5CB67] hover:text-[#E5CB67] transition-colors active:scale-95"
                    >
                        <Plus size={32} />
                    </button>
                </div>

                <div className="p-4 bg-[#E5CB67]/10 border border-[#E5CB67]/20 rounded-xl text-[#E5CB67] text-xs text-center max-w-xs">
                    <Users size={16} className="inline-block mr-2 mb-1" />
                    Podrás agregar los perfiles y fotos de tu equipo más adelante en el panel de administración.
                </div>

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs text-center w-full">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 w-full mt-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="w-1/3 py-4 rounded-xl font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Volver
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 bg-[#E5CB67] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E5CB67]/10"
                    >
                        {loading ? "Guardando..." : "Continuar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
