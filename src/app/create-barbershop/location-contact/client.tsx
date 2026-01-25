"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, MessageCircle, ChevronLeft, Loader2, ArrowRight } from "lucide-react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { saveLocationAndContact, searchLocationAction } from "./actions"; // Importamos la Server Action

// --- Componente PremiumInput (Estilos corregidos y unificados) ---
const PremiumInput = ({
    label,
    icon: Icon,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    className = "",
    type = "text",
    isLoading = false,
    ...props
}: any) => (
    <div className={`flex flex-col gap-2 group ${className}`}>
        <label className="text-sm font-medium text-gray-400 ml-1 tracking-wide group-focus-within:text-[#E5CB67] transition-colors duration-300">
            {label} {required && <span className="text-[#FF8A00]">*</span>}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/70 transition-colors duration-300 group-focus-within:text-[#E5CB67]">
                {isLoading ? (
                    <Loader2 size={20} className="animate-spin text-[#E5CB67]" />
                ) : (
                    Icon && <Icon size={20} strokeWidth={1.5} />
                )}
            </div>
            <input
                name={name}
                value={value}
                onChange={onChange}
                type={type}
                placeholder={placeholder}
                required={required}
                // Estilos Dark Glass + Foco Dorado (#E5CB67)
                className="w-full bg-white/[0.03] border border-white/[0.1] backdrop-blur-sm rounded-xl py-4 pl-12 pr-4 text-gray-200 placeholder-gray-600 transition-all duration-300 ease-out hover:bg-white/[0.05] hover:border-white/[0.2] focus:bg-black focus:border-[#E5CB67] focus:text-white focus:outline-none focus:shadow-[0_0_15px_rgba(229,203,103,0.15)]"
                {...props}
            />
        </div>
    </div>
);

export default function LocationContactClient({ initialData }: { initialData?: any }) {
    const router = useRouter();
    // Estado inicial (Coordenadas de Cali por defecto)
    const [formData, setFormData] = useState({
        address: initialData?.address || "",
        phone: initialData?.phone || "",
        whatsapp: initialData?.whatsapp || "",
        latitude: initialData?.latitude || 3.44,
        longitude: initialData?.longitude || -76.52,
    });

    const [loading, setLoading] = useState(false);
    const [searchingLocation, setSearchingLocation] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs del Mapa
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);

    // 1. Inicializar Mapa (Solo una vez al montar)
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'osm': {
                        type: 'raster',
                        tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors'
                    }
                },
                layers: [{
                    id: 'osm-layer',
                    type: 'raster',
                    source: 'osm',
                    paint: { 'raster-saturation': -0.5 }
                }]
            },
            center: [formData.longitude, formData.latitude],
            zoom: 13,
            attributionControl: false
        });

        // Marcador Draggable (Arrastrable)
        marker.current = new maplibregl.Marker({ color: "#FF8A00", draggable: true })
            .setLngLat([formData.longitude, formData.latitude])
            .addTo(map.current);

        // Listener: Cuando el usuario mueve el pin manualmente
        marker.current.on('dragend', () => {
            const lngLat = marker.current?.getLngLat();
            if (lngLat) {
                setFormData(prev => ({
                    ...prev,
                    latitude: lngLat.lat,
                    longitude: lngLat.lng
                }));
            }
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // 2. Lógica Segura: Frontend Debounce -> Server Action
    useEffect(() => {
        // No buscar si es muy corto
        if (formData.address.length < 5) return;

        // DEBOUNCE: Esperar 1.2 segundos a que el usuario termine de escribir
        const delayDebounceFn = setTimeout(async () => {
            setSearchingLocation(true);

            // LLAMADA SEGURA AL BACKEND
            const result = await searchLocationAction(formData.address);

            if (result.data && result.data.length > 0) {
                const place = result.data[0];
                const lat = parseFloat(place.lat);
                const lon = parseFloat(place.lon);

                // Actualizar estado sin borrar los otros campos
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon
                }));

                // Animación de vuelo hacia la ubicación
                if (map.current && marker.current) {
                    map.current.flyTo({ center: [lon, lat], zoom: 16, essential: true });
                    marker.current.setLngLat([lon, lat]);
                }
            } else if (result.error) {
                console.warn(result.error);
            }

            setSearchingLocation(false);
        }, 1200); // 1200ms de paciencia

        return () => clearTimeout(delayDebounceFn);
    }, [formData.address]);

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
            if (result?.error) throw new Error(result.error);

            router.push('/create-barbershop/visual-identity');
        } catch (err: any) {
            setError(err.message || "Error al guardar ubicación.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
            <div className="w-full px-6 md:px-8 pt-6 pb-12 flex flex-col max-w-lg md:max-w-2xl mx-auto animate-fade-in">

                {/* Header Navigation */}
                <div className="flex items-center mb-6">
                    <Link
                        href="/create-barbershop/business-info"
                        className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-xl">
                        Ubicación y Contacto
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                        ¿Dónde te encuentran tus clientes? Asegúrate de que puedan contactarte fácilmente.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">

                    <PremiumInput
                        label="Dirección Física"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Ej: Carrera 100 # 16-20"
                        icon={MapPin}
                        isLoading={searchingLocation}
                        required
                    />

                    {/* Contenedor del Mapa (Modo Oscuro con Filtros CSS) */}
                    <div className="w-full h-64 rounded-2xl overflow-hidden relative border border-white/10 mt-2 shadow-2xl group transition-all duration-500 hover:border-[#E5CB67]/30">
                        <div
                            ref={mapContainer}
                            className="w-full h-full"
                            style={{ filter: "invert(100%) hue-rotate(180deg) brightness(90%) grayscale(20%) contrast(85%)" }}
                        />

                        {/* Aviso flotante UX */}
                        <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none z-10">
                            <span className="bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-wider text-white/70 px-3 py-1 rounded-full border border-white/10 shadow-lg">
                                📍 Arrastra el pin para mayor precisión
                            </span>
                        </div>

                        {/* Inputs Ocultos para enviar coordenadas al submit */}
                        <input type="hidden" name="latitude" value={formData.latitude || ""} />
                        <input type="hidden" name="longitude" value={formData.longitude || ""} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PremiumInput
                            label="Teléfono Móvil"
                            name="phone"
                            value={formData.phone}
                            onChange={(e: any) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                            placeholder="300 123 4567"
                            icon={Phone}
                            required
                        />

                        <PremiumInput
                            label="WhatsApp Business"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={(e: any) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                            placeholder="300 123 4567"
                            icon={MessageCircle}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 text-sm text-center flex items-center justify-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Botón Submit Circular Estático */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mx-auto mt-8 w-16 h-16 rounded-full 
                                   bg-[#FF8A00] text-black shadow-[0_4px_20px_rgba(255,138,0,0.4)]
                                   flex items-center justify-center
                                   hover:scale-105 active:scale-95 transition-all duration-300
                                   disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-white" size={28} />
                        ) : (
                            <ArrowRight size={28} strokeWidth={2} className="text-white" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
