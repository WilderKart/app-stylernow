"use client";

import { useState } from "react";
import { Scissors, Plus, X, Clock, DollarSign, Loader2 } from "lucide-react";
import { createService } from "../actions";

export default function ServiceManager({ initialServices }: { initialServices: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);
            const res = await createService(formData);
            if (res?.error) throw new Error(res.error);

            setIsModalOpen(false);
            // Revalidation happens on server, but we could optimistic update here if needed
            // For now, rely on standard Next.js revalidation refresh
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Servicios</h2>
                    <p className="text-gray-500 text-sm">Gestiona el catálogo de tu barbería.</p>
                </div>
                {initialServices.length > 0 && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#FF8A00] text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#FF9F2A] transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Nuevo Servicio
                    </button>
                )}
            </div>

            {initialServices.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 bg-[#111] border border-gray-800 rounded-2xl relative overflow-hidden">
                    {/* Spotlight */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF8A00]/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="bg-[#1A1A1A] p-6 rounded-full mb-6 relative z-10 border border-white/5 shadow-xl">
                        <Scissors size={48} className="text-[#FF8A00]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Define tu estilo</h3>
                    <p className="text-gray-500 text-sm mb-8 relative z-10">Crea tu primer servicio para empezar.</p>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#FF8A00] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#FF9F2A] transition-all shadow-lg shadow-[#FF8A00]/20 relative z-10 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Crear Servicio
                    </button>
                </div>
            ) : (
                // List
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {initialServices.map((service) => (
                        <div key={service.id} className="bg-[#111] border border-gray-800 p-5 rounded-xl hover:border-[#FF8A00]/50 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Actions placeholder */}
                            </div>

                            <h4 className="font-bold text-white text-lg mb-1">{service.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                                <span className="flex items-center gap-1"><DollarSign size={14} /> {service.price}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {service.duration_min} min</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#121212] w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden scale-in-center">
                        <div className="flex justify-between items-center p-5 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white">Nuevo Servicio</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="text-xs text-gray-400 font-medium ml-1">Nombre</label>
                                <input name="name" placeholder="Ej: Corte Clásico" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white focus:border-[#FF8A00] outline-none mt-1" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium ml-1">Precio</label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                                        <input name="price" type="number" placeholder="0.00" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 pl-7 text-white focus:border-[#FF8A00] outline-none" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-medium ml-1">Duración (min)</label>
                                    <select name="duration_min" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white focus:border-[#FF8A00] outline-none mt-1">
                                        <option value="15">15 min</option>
                                        <option value="30">30 min</option>
                                        <option value="45">45 min</option>
                                        <option value="60">60 min</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium ml-1">Descripción (Opcional)</label>
                                <textarea name="description" placeholder="Breve detalle..." className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white focus:border-[#FF8A00] outline-none mt-1 h-20 resize-none" />
                            </div>

                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#FF8A00] text-black w-full py-3 rounded-xl font-bold hover:bg-[#FF9F2A] transition-colors mt-2 flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {loading ? "Guardando..." : "Guardar Servicio"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
