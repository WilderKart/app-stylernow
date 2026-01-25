"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveBusinessInfo } from "../actions";
import { Country, City } from "country-state-city";
import {
    Building,
    Store,
    Globe,
    MapPin,
    User,
    Building2,
    FileText,
    ChevronDown,
    Loader2,
    Check,
    ChevronLeft,
    ArrowRight
} from "lucide-react";

// --- Types ---
interface BusinessInfoClientProps {
    initialData?: {
        name?: string;
        commercial_name?: string;
        business_type?: string;
        document_number?: string;
        city?: string;
        country?: string;
    }
}

interface ISubdivision {
    name: string;
    isoCode?: string; // For Country
}

// --- Icons Map ---
const FORM_ICONS = {
    name: Building,
    commercial: Store,
    country: Globe,
    city: MapPin,
    person: User,
    company: Building2,
    doc: FileText,
};

// --- Helper Components ---

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
    ...props
}: any) => (
    <div className={`flex flex-col gap-2 group ${className}`}>
        <label className="text-sm font-medium text-gray-400 ml-1 tracking-wide group-focus-within:text-[#E5CB67] transition-colors duration-300">
            {label} {required && <span className="text-[#FF8A00]">*</span>}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/70 transition-colors duration-300 group-focus-within:text-[#E5CB67]">
                {Icon && <Icon size={20} strokeWidth={1.5} />}
            </div>
            <input
                name={name}
                value={value}
                onChange={onChange}
                type={type}
                placeholder={placeholder}
                required={required}
                className="w-full bg-white/[0.03] border border-white/[0.1] backdrop-blur-sm rounded-xl py-4 pl-12 pr-4 text-gray-200 placeholder-gray-600 
                           transition-all duration-300 ease-out
                           hover:bg-white/[0.05] hover:border-white/[0.2]
                           focus:bg-black focus:border-[#E5CB67] focus:text-white focus:outline-none focus:shadow-[0_0_15px_rgba(229,203,103,0.15)]"
                {...props}
            />
        </div>
    </div>
);

const PremiumSelect = ({
    label,
    icon: Icon,
    value,
    onChange,
    options,
    required = false,
    ...props
}: any) => (
    <div className="flex flex-col gap-2 group">
        <label className="text-sm font-medium text-gray-400 ml-1 tracking-wide group-focus-within:text-[#E5CB67] transition-colors duration-300">
            {label} {required && <span className="text-[#FF8A00]">*</span>}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/70 transition-colors duration-300 group-focus-within:text-[#E5CB67]">
                {Icon && <Icon size={20} strokeWidth={1.5} />}
            </div>
            <select
                value={value}
                onChange={onChange}
                className="w-full bg-white/[0.03] border border-white/[0.1] backdrop-blur-sm rounded-xl py-4 pl-12 pr-10 text-gray-200 
                           appearance-none cursor-pointer transition-all duration-300 ease-out
                           hover:bg-white/[0.05] hover:border-white/[0.2]
                           focus:bg-black focus:border-[#E5CB67] focus:text-white focus:outline-none focus:shadow-[0_0_15px_rgba(229,203,103,0.15)]
                           [&>option]:bg-black [&>option]:text-white"
                {...props}
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400/70">
                <ChevronDown size={16} />
            </div>
        </div>
    </div>
);

// --- City Combobox Component ---
const CityCombobox = ({ countryCode, value, onChange }: { countryCode: string, value: string, onChange: (val: string) => void }) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load cities based on country code
    const cities = useMemo(() => {
        if (!countryCode) return [];
        return City.getCitiesOfCountry(countryCode) || [];
    }, [countryCode]);

    // Filter cities
    const filteredCities = useMemo(() => {
        if (!query) return cities.slice(0, 50); // Limit initial view
        return cities.filter((city) =>
            city.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 50); // Limit results for perf
    }, [cities, query]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effect: sync query with value if separate
    useEffect(() => {
        if (value && !isOpen) {
            // If value is set externally or on load, we might want to sync query?
            // But actually value is what we save. Query is for searching.
        }
    }, [value, isOpen]);

    return (
        <div className="flex flex-col gap-2 group relative" ref={containerRef}>
            <label className="text-sm font-medium text-gray-400 ml-1 tracking-wide group-focus-within:text-[#E5CB67] transition-colors duration-300">
                Ciudad <span className="text-[#FF8A00]">*</span>
            </label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/70 transition-colors duration-300 group-focus-within:text-[#E5CB67]">
                    <FORM_ICONS.city size={20} strokeWidth={1.5} />
                </div>
                <input
                    type="text"
                    value={value || query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value); // Also update parent value as they type
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Buscar ciudad..."
                    className="w-full bg-white/[0.03] border border-white/[0.1] backdrop-blur-sm rounded-xl py-4 pl-12 pr-4 text-gray-200 placeholder-gray-600 
                               transition-all duration-300 ease-out
                               hover:bg-white/[0.05] hover:border-white/[0.2]
                               focus:bg-black focus:border-[#E5CB67] focus:text-white focus:outline-none focus:shadow-[0_0_15px_rgba(229,203,103,0.15)]"
                />
                {/* Dropdown */}
                {isOpen && cities.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl max-h-60 overflow-y-auto z-50 shadow-2xl shadow-black/50 scrollbar-thin scrollbar-track-[#111] scrollbar-thumb-[#333]">
                        {filteredCities.length === 0 ? (
                            <div className="p-4 text-gray-500 text-sm text-center">No se encontraron ciudades.</div>
                        ) : (
                            filteredCities.map((city, idx) => (
                                <button
                                    key={`${city.name}-${city.latitude}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                        onChange(city.name);
                                        setQuery(""); // Reset query? Or keep name? Using value for input now so it works.
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 text-gray-300 flex items-center justify-between
                                        ${value === city.name ? 'text-[#E5CB67] bg-white/5' : ''}`}
                                >
                                    <span>{city.name}</span>
                                    {value === city.name && <Check size={14} className="text-[#E5CB67]" />}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default function BusinessInfoClient({ initialData }: BusinessInfoClientProps) {
    const router = useRouter();

    // --- State ---
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        commercial_name: initialData?.commercial_name || "",
        business_type: initialData?.business_type || "NATURAL",
        document_number: initialData?.document_number || "",
        city: initialData?.city || "",
        country: initialData?.country || "CO", // Default Colombia
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Countries ---
    // Memoize country list with priority sorting
    const countryOptions = useMemo(() => {
        const all = Country.getAllCountries();
        const priorities = ['CO', 'ES', 'PT'];

        const top = all.filter(c => priorities.includes(c.isoCode)).sort((a, b) => {
            return priorities.indexOf(a.isoCode) - priorities.indexOf(b.isoCode);
        });
        const rest = all.filter(c => !priorities.includes(c.isoCode));

        return [...top, ...rest].map(c => ({
            value: c.isoCode,
            label: c.name
        }));
    }, []);


    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            country: e.target.value,
            city: "" // Reset city on country change
        }));
    };

    const handleCityChange = (cityName: string) => {
        setFormData(prev => ({ ...prev, city: cityName }));
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
            router.push('/create-barbershop/location-contact');
        } catch (err: any) {
            setError(err.message || "Error al guardar información.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
            <div className="w-full px-6 md:px-8 pt-6 pb-12 flex flex-col max-w-lg md:max-w-2xl mx-auto animate-fade-in">

                {/* Header Navigation */}
                <div className="flex items-center mb-6">
                    <Link
                        href="/create-barbershop/intro"
                        className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-xl">
                        Datos del Negocio
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                        Cuéntanos sobre tu barbería. Esta información se usará para tu perfil público y documentos legales.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">

                    <PremiumInput
                        label="Razón Social / Nombre Legal"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: Inversiones SAS"
                        icon={FORM_ICONS.name}
                        required
                    />

                    <PremiumInput
                        label="Nombre Comercial"
                        name="commercial_name"
                        value={formData.commercial_name}
                        onChange={handleChange}
                        placeholder="Ej: Barbería El Rey"
                        icon={FORM_ICONS.commercial}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PremiumSelect
                            label="País"
                            value={formData.country}
                            onChange={handleCountryChange}
                            options={countryOptions}
                            icon={FORM_ICONS.country}
                            required
                        />

                        <CityCombobox
                            countryCode={formData.country}
                            value={formData.city}
                            onChange={handleCityChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PremiumSelect
                            label="Tipo Persona"
                            value={formData.business_type}
                            onChange={handleChange}
                            name="business_type" // needed for generic handler
                            options={[
                                { value: "NATURAL", label: "Natural" },
                                { value: "JURIDICA", label: "Jurídica (SAS, Ltda)" }
                            ]}
                            icon={formData.business_type === 'JURIDICA' ? FORM_ICONS.company : FORM_ICONS.person}
                        />

                        <PremiumInput
                            label="Nro. Documento/NIT"
                            name="document_number"
                            value={formData.document_number}
                            onChange={(e: any) => setFormData({ ...formData, document_number: e.target.value.replace(/[^0-9]/g, '') })}
                            placeholder="Ej: 900123456"
                            icon={FORM_ICONS.doc}
                            required
                        />
                    </div>

                    {formData.business_type === 'JURIDICA' && (
                        <p className="text-xs text-[#FF8A00]/80 -mt-2 ml-1">
                            * Incluye el dígito de verificación sin guiones
                        </p>
                    )}

                    {error && (
                        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 text-sm text-center flex items-center justify-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}


                    {/* Static Circular Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mx-auto mt-10 w-16 h-16 rounded-full 
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
