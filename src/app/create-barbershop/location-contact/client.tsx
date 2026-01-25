"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { saveLocationAndContact } from "../actions";

export default function LocationContactClient({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        address: initialData?.address || "",
        phone: initialData?.phone || "",
        whatsapp: initialData?.whatsapp || "",
        latitude: initialData?.latitude || null,
        longitude: initialData?.longitude || null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.address || !formData.phone || !formData.whatsapp) {
                throw new Error("Por favor completa todos los campos.");
            }

            const result = await saveLocationAndContact(formData);
            if (result?.error) {
                throw new Error(result.error);
            }
            router.push('/create-barbershop/visual-identity');
        } catch (err: any) {
            setError(err.message || "Error al guardar ubicación.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm md:max-w-md animate-fade-in flex flex-col items-center">
            {/* Steps indicator */}
            <div className="flex gap-2 mb-6">
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-8 h-1 bg-[#FF8A00] rounded-full"></div>
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
            </div>

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Ubicación y Contacto
                </h1>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                    ¿Dónde te encuentran tus clientes?
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                        <MapPin size={16} className="text-[#FF8A00]" />
                        Dirección Física
                    </label>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Ej: Carrera 10 # 93-12"
                        className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors"
                        required
                    />
                </div>

                {/* Map Placeholder */}
                <div className="w-full h-32 bg-[#1A1A1A] border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 text-xs flex-col gap-2 pointer-events-none opacity-80">
                    <MapPin size={24} className="text-gray-600" />
                    <p>Ubicación en mapa (Próximamente)</p>
                    <input type="hidden" name="latitude" value={formData.latitude || ""} />
                    <input type="hidden" name="longitude" value={formData.longitude || ""} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <Phone size={16} className="text-[#FF8A00]" />
                            Teléfono Fijo/Móvil
                        </label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                            placeholder="300 000 0000"
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <MessageCircle size={16} className="text-[#FF8A00]" />
                            WhatsApp
                        </label>
                        <input
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                            placeholder="310 000 0000"
                            className="w-full bg-[#121212] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF8A00] focus:outline-none transition-colors"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF8A00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF8A00]/10"
                >
                    {loading ? "Guardando..." : "Siguiente"}
                </button>
            </form>
        </div>
    );
}
