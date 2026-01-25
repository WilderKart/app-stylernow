"use client";

import { useState } from "react";
import Image from "next/image";
import { saveVisualIdentity } from "../actions";

export default function VisualIdentityClient({
    barbershopId,
    initialLogo,
    initialBanner,
    businessName
}: {
    barbershopId: string,
    initialLogo?: string | null,
    initialBanner?: string | null,
    businessName: string
}) {
    const [logoPreview, setLogoPreview] = useState<string | null>(initialLogo || null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(initialBanner || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'logo') setLogoPreview(url);
            else setBannerPreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);
            const result = await saveVisualIdentity(formData);

            if (result?.error) {
                throw new Error(result.error);
            }
        } catch (err: any) {
            setError(err.message || "Error al subir imágenes.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm md:max-w-md animate-fade-in flex flex-col items-center">
            {/* Steps */}
            <div className="flex gap-2 mb-6">
                <div className="w-8 h-1 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-1 bg-[#FF8A00] rounded-full"></div>
                <div className="w-8 h-1 bg-gray-700 rounded-full"></div>
            </div>

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Dale identidad a {businessName}
                </h1>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                    Sube el logo y una portada para que tus clientes te reconozcan.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                {/* Logo Upload */}
                <div className="flex flex-col items-center gap-2">
                    <label className="text-sm font-medium text-white">Logo del Negocio</label>
                    <label className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#FF8A00] transition-colors bg-[#121212] overflow-hidden group">
                        <input
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'logo')}
                            className="hidden"
                        />
                        {logoPreview ? (
                            <Image src={logoPreview} alt="Logo Preview" fill className="object-cover" />
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center gap-1 group-hover:text-[#FF8A00]">
                                <span className="text-2xl">📷</span>
                                <span className="text-xs">Subir</span>
                            </div>
                        )}
                    </label>
                </div>

                {/* Banner Upload */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white ml-1">Portada / Banner </label>
                    <label className="relative w-full h-32 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#FF8A00] transition-colors bg-[#121212] overflow-hidden group">
                        <input
                            type="file"
                            name="banner"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'banner')}
                            className="hidden"
                        />
                        {bannerPreview ? (
                            <Image src={bannerPreview} alt="Banner Preview" fill className="object-cover" />
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center gap-1 group-hover:text-[#FF8A00]">
                                <span className="text-2xl">🖼️</span>
                                <span className="text-xs">Subir Imagen Horizontal</span>
                            </div>
                        )}
                    </label>
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
                        {loading ? "Subiendo..." : "Continuar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
