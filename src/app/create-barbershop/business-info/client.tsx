"use client";

import { useState } from "react";
import Image from "next/image";
import { saveBusinessInfo } from "../actions";

export default function BusinessInfoClient({ initialData }: { initialData?: any }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        commercial_name: initialData?.commercial_name || "",
        business_type: initialData?.business_type || "NATURAL",
        document_number: initialData?.document_number || "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.name || !formData.document_number) {
                throw new Error("Nombre y documento son obligatorios.");
            }

            const result = await saveBusinessInfo(formData);
            if (result?.error) {
                throw new Error(result.error);
            }
            // Redirect handled by action
        } catch (err: any) {
            setError(err.message || "Error al guardar información.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm md:max-w-md animate-fade-in flex flex-col items-center">
            {/* Steps indicator (Optional visual aid) */}
            <div className="flex gap-2 mb-6">
                <div className="w-8 h-1 bg-[#FF8A00] rounded-full"></div>
                <div className="w-8 h-1 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-1 bg-gray-700 rounded-full"></div>
            </div>

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Datos del Negocio
                </h1>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                    Cuéntanos sobre tu barbería. Esta información se usará para tu perfil público y documentos legales.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Razón Social / Nombre Legal</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: Carlos Andrés Pérez o Inversiones SAS"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Nombre Comercial (Como te conocen)</label>
                    <input
                        name="commercial_name"
                        value={formData.commercial_name}
                        onChange={handleChange}
                        placeholder="Ej: Barbería El Rey"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white ml-1">Tipo Persona</label>
                        <select
                            name="business_type"
                            value={formData.business_type}
                            onChange={handleChange}
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white focus:border-[#FF8A00] focus:outline-none transition-colors appearance-none"
                        >
                            <option value="NATURAL">Natural</option>
                            <option value="JURIDICA">Jurídica (SAS, Ltda)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white ml-1">Nro. Documento/NIT</label>
                        <input
                            name="document_number"
                            value={formData.document_number}
                            onChange={(e) => setFormData({ ...formData, document_number: e.target.value.replace(/\D/g, '') })}
                            placeholder="Ej: 900123456"
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors"
                            required
                        />
                        {formData.business_type === 'JURIDICA' && (
                            <p className="text-xs text-[#FF8A00] ml-1">
                                * Debe incluir el dígito de verificación (Sin guiones).
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs text-center mt-2">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF8A00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF8A00]/10 mt-4"
                >
                    {loading ? "Guardando..." : "Siguiente"}
                </button>
            </form>
        </div>
    );
}
