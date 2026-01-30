"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveStaffCount } from "../actions";
import { UserPlus, Minus, Plus, User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function StaffCountClient({ initialCount }: { initialCount: number }) {
    const router = useRouter();
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Haptics Utility
    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    };

    const increment = () => {
        if (count < 50) {
            triggerHaptic();
            setCount(prev => prev + 1);
        }
    };

    const decrement = () => {
        if (count > 1) {
            triggerHaptic();
            setCount(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await saveStaffCount(count);
            if (result?.error) {
                throw new Error(result.error);
            }
            router.push('/create-barbershop/services');
        } catch (err: any) {
            setError(err.message || "Error al guardar.");
            setLoading(false);
        }
    };



    return (
        <div className="w-full min-h-screen bg-black text-gray-200 font-sans flex flex-col relative overflow-hidden">

            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/barber-bg.png"
                    alt="Barber Atmosphere"
                    fill
                    className="object-cover opacity-40"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
            </div>

            {/* Header / Nav */}
            <div className="relative z-10 w-full max-w-lg md:max-w-2xl mx-auto px-6 py-8 flex items-center justify-between">
                <Link href="/create-barbershop/visual-identity" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Paso 4 de 5</span>
                <div className="w-8"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto px-6 pb-20">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Escala del Equipo</h1>
                    <p className="text-zinc-500 text-sm">¿Cuántos profesionales trabajan contigo?</p>
                </motion.div>

                {/* Hero Counter - Centered Layout */}
                <div className="flex items-center justify-center gap-8 w-full max-w-xs mx-auto mb-12 relative">
                    <motion.button
                        type="button"
                        onClick={decrement}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-lg"
                    >
                        <Minus size={28} />
                    </motion.button>

                    <div className="relative w-24 text-center shrink-0">
                        <motion.span
                            key={count}
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="text-8xl font-bold text-white tracking-tighter block leading-none"
                            style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}
                        >
                            {count}
                        </motion.span>
                    </div>

                    <motion.button
                        type="button"
                        onClick={increment}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-lg"
                    >
                        <Plus size={28} />
                    </motion.button>
                </div>

                {/* Dynamic Avatars Visualization */}
                <div className="h-20 flex items-center justify-center gap-2 mb-16 px-4 flex-wrap overflow-hidden w-full">
                    <AnimatePresence mode="popLayout">
                        {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center shadow-md relative group"
                            >
                                <User size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                                {i === 7 && count > 8 && (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm text-[10px] font-bold">
                                        +{count - 7}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Info Note */}
                <div className="flex items-center gap-3 text-zinc-500 text-sm mb-12 bg-zinc-900/80 backdrop-blur-md px-5 py-3 rounded-full border border-white/5 shadow-lg">
                    <UserPlus size={16} />
                    <span>Podrás configurar los perfiles detallados más adelante</span>
                </div>

                {/* Submit Action */}
                <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-5 rounded-full bg-[#E5CB67] text-black text-lg font-bold shadow-xl shadow-[#E5CB67]/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Guardando..." : "Continuar"}
                </motion.button>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 text-red-400 text-sm font-medium"
                    >
                        {error}
                    </motion.div>
                )}

            </div>
        </div>
    );
}
