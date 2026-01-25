"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveVisualIdentity } from "../actions";
import TimeWheelPicker from "@/components/ui/TimeWheelPicker";
import { Camera, Plus } from "lucide-react";

export default function VisualIdentityClient({
    barbershopId,
    initialLogo,
    initialBanner, // Legacy support if needed, but we focus on local photos now
    businessName
}: {
    barbershopId: string,
    initialLogo?: string | null,
    initialBanner?: string | null,
    businessName: string
}) {
    const router = useRouter();
    const [logoPreview, setLogoPreview] = useState<string | null>(initialLogo || null);
    const [localPhotos, setLocalPhotos] = useState<string[]>([]); // URLs for preview
    const [description, setDescription] = useState("");
    const [openTime, setOpenTime] = useState("09:00 AM");
    const [closeTime, setCloseTime] = useState("07:00 PM");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleLocalPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + localPhotos.length > 2) {
            alert("Máximo 2 fotos");
            return;
        }

        const newPreviews = files.map(f => URL.createObjectURL(f));
        setLocalPhotos([...localPhotos, ...newPreviews]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);

            // Append visual identity extra fields manually if needed or they are already in form inputs
            // Time wheel piucker state needs to be added
            const openingHours = { open: openTime, close: closeTime };
            formData.set('opening_hours', JSON.stringify(openingHours));

            // Description is in textarea name="description" so it's auto collected

            const result = await saveVisualIdentity(formData);

            if (result?.error) {
                throw new Error(result.error);
            }
            router.push('/create-barbershop/staff-count');
        } catch (err: any) {
            setError(err.message || "Error al subir imágenes.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm md:max-w-md animate-fade-in flex flex-col items-center pb-20">
            {/* Steps */}
            <div className="flex gap-2 mb-6">
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-8 h-1 bg-[#FF8A00] rounded-full"></div>
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
            </div>

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Identidad Visual
                </h1>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                    Personaliza la apariencia de {businessName}.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
                {/* Logo Upload */}
                <div className="flex flex-col items-center gap-2">
                    <label className="text-sm font-medium text-white">Logo del Negocio</label>
                    <label className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#FF8A00] transition-colors bg-[#121212] overflow-hidden group shadow-xl">
                        <input
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                        />
                        {logoPreview ? (
                            <Image src={logoPreview} alt="Logo Preview" fill className="object-cover" />
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center gap-1 group-hover:text-[#FF8A00]">
                                <Camera size={24} />
                                <span className="text-xs">Subir</span>
                            </div>
                        )}
                    </label>
                </div>

                {/* Local Photos */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-white ml-1">Fotos del Local (Max 2)</label>
                    <div className="flex gap-4">
                        {/* Previews */}
                        {localPhotos.map((src, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-700">
                                <Image src={src} alt="Local" fill className="object-cover" />
                            </div>
                        ))}

                        {/* Upload Button */}
                        {localPhotos.length < 2 && (
                            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#FF8A00] transition-colors bg-[#121212] flex-shrink-0">
                                <input
                                    type="file"
                                    name="local_photos"
                                    accept="image/*"
                                    multiple
                                    onChange={handleLocalPhotosChange}
                                    className="hidden"
                                />
                                <Plus size={24} className="text-gray-500" />
                            </label>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Descripción Breve</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Especialistas en cortes clásicos y modernos..."
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors h-24 resize-none"
                    />
                </div>

                {/* Hours - Wheel Picker */}
                <div className="flex flex-col gap-4">
                    <label className="text-sm font-medium text-white ml-1">Horario de Atención</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-center text-gray-500 uppercase tracking-widest">Apertura</span>
                            <TimeWheelPicker value={openTime} onChange={setOpenTime} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-center text-gray-500 uppercase tracking-widest">Cierre</span>
                            <TimeWheelPicker value={closeTime} onChange={setCloseTime} />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs text-center">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 mt-2">
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
                        className="w-2/3 bg-[#FF8A00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF8A00]/10"
                    >
                        {loading ? "Guardando..." : "Siguiente"}
                    </button>
                </div>
            </form>
        </div>
    );
}
