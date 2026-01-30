"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleService, saveCustomService, deleteCustomService } from "../actions";
import { Plus, Check, Edit2, Trash2, X, DollarSign, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type ServiceItem = {
    id: string; // Internal slug for globals, UUID for customs
    name: string;
    category: string;
    isActive: boolean;
    imageName?: string; // For globals
    image_url?: string; // For customs or overrides
    dbId?: string; // UUID if persisted
    price?: number;
    duration?: number;
};

export default function ServicesClient({ initialGlobals, initialCustoms, barbershopId }: any) {
    const router = useRouter();
    const [globals, setGlobals] = useState<ServiceItem[]>(initialGlobals);
    const [customs, setCustoms] = useState<ServiceItem[]>(initialCustoms);

    const [editingService, setEditingService] = useState<any | null>(null); // For Bottom Sheet
    const [loading, setLoading] = useState(false);

    // --- Actions ---

    const handleToggleGlobal = async (item: ServiceItem) => {
        // Optimistic UI
        const newStatus = !item.isActive;
        setGlobals(prev => prev.map(g => g.id === item.id ? { ...g, isActive: newStatus } : g));

        // Interaction
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);

        // Server Call
        await toggleService(item.id, newStatus, false);
        router.refresh(); // Sync DB ID if newly created
    };

    const handleToggleCustom = async (item: ServiceItem) => {
        const newStatus = !item.isActive;
        setCustoms(prev => prev.map(c => c.id === item.id ? { ...c, isActive: newStatus } : c));

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        await toggleService(item.id, newStatus, true);
    };

    const handleOpenEdit = (item: ServiceItem, isCustom: boolean) => {
        setEditingService({ ...item, isCustom });
    };

    // --- Render Helpers ---

    const ServiceCard = ({ item, isCustom }: { item: ServiceItem, isCustom: boolean }) => {
        // Image Resolver
        // Global images are in /servicios/[category]/[name].jpg.
        // Custom are absolute or storage paths.
        // Simplification for now:
        const imgSrc = isCustom
            ? (item.image_url || "/placeholder.jpg")
            : `/servicios/${item.category === 'BARBERSHOP' ? 'barberia' : 'manicure'}/${item.imageName}`;

        return (
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`
                    relative aspect-[4/5] rounded-2xl overflow-hidden border transition-all duration-300 group
                    ${item.isActive ? "border-[#E5CB67] shadow-[0_0_15px_rgba(229,203,103,0.2)]" : "border-white/5 grayscale"}
                `}
            >
                <Image
                    src={imgSrc}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-4 left-4 right-14">
                    <h3 className={`font-bold leading-tight ${item.isActive ? "text-white" : "text-gray-400"}`}>
                        {item.name}
                    </h3>
                </div>

                {/* Action Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isCustom) handleToggleCustom(item);
                        else handleToggleGlobal(item);
                    }}
                    className={`
                        absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90
                        ${item.isActive ? "bg-[#E5CB67] text-black" : "bg-white/10 text-white backdrop-blur-md hover:bg-white/20"}
                    `}
                >
                    {item.isActive ? <Check size={18} strokeWidth={3} /> : <Plus size={20} />}
                </button>
            </motion.div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 pb-32">

            {/* Main Content */}
            <div className="w-full max-w-md mx-auto relative">

                {/* Header */}
                <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">Catálogo de Servicios</h1>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest">Paso 4 de 5</span>
                </div>

                <div className="p-6 space-y-8">

                    {/* BARBERSHOP Section */}
                    <div className="space-y-4">
                        <div className="sticky top-16 z-20 bg-zinc-950/95 py-2 backdrop-blur-md">
                            <h2 className="text-[#E5CB67] text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#E5CB67]"></span>
                                Barbería
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {globals.filter(g => g.category === 'BARBERSHOP').map(g => (
                                <ServiceCard key={g.id} item={g} isCustom={false} />
                            ))}
                        </div>
                    </div>

                    {/* MANICURE Section */}
                    <div className="space-y-4">
                        <div className="sticky top-16 z-20 bg-zinc-950/95 py-2 backdrop-blur-md">
                            <h2 className="text-pink-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                                Manicura
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {globals.filter(g => g.category === 'MANICURE').map(g => (
                                <ServiceCard key={g.id} item={g} isCustom={false} />
                            ))}
                        </div>
                    </div>

                    {/* Custom Section */}
                    {customs.length > 0 && (
                        <div className="space-y-4">
                            <div className="sticky top-16 z-20 bg-zinc-950/95 py-2 backdrop-blur-md">
                                <h2 className="text-purple-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                    Personalizados
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {customs.map(c => (
                                    <ServiceCard key={c.id} item={c} isCustom={true} />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Floating "Next" Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40 pointer-events-none">
                <button
                    onClick={() => router.push('/create-barbershop/completed')} // Or next step
                    className="w-full max-w-md mx-auto py-5 rounded-full bg-[#E5CB67] text-black text-lg font-bold shadow-xl shadow-[#E5CB67]/10 flex items-center justify-center gap-2 pointer-events-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Guardar y Continuar
                </button>
            </div>

        </div>
    );
}
