"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveVisualIdentity } from "../actions"; // Local action wrapper
// Import icons
import { Camera, X, ChevronLeft, ArrowRight, Loader2, Clock, Trash2, Edit2, Plus, Calendar, Power, Info } from "lucide-react";
// Import Framer Motion
import { motion, AnimatePresence } from "framer-motion";

// --- UI Types (Frontend State) ---
type Time = { hour: string, minute: string, ampm: "AM" | "PM" };

type ScheduleBlock = {
    id: string;
    days: string[]; // "0".."6"
    isOpen: boolean;
    open: Time;
    close: Time;
};

// --- Backend Contract Types ---
type DayParams = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
type BackendScheduleItem = {
    day: DayParams;
    openMinutes: number;
    closeMinutes: number;
    isClosed: boolean;
};

// --- Helpers ---
const formatTime = (t: Time) => `${t.hour}:${t.minute} ${t.ampm}`;
const formatHourPretty = (hour: string) => hour.startsWith('0') && hour !== '00' ? hour.substring(1) : hour;
const getDayLabel = (idx: string) => ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][parseInt(idx)];
const dayList = ["0", "1", "2", "3", "4", "5", "6"];

// Helper to sort days and format range string
const formatDayRange = (activeDays: string[]) => {
    if (activeDays.length === 0) return "Sin días";
    if (activeDays.length === 7) return "Todos los días";

    const sorted = [...activeDays].sort();

    // Check contiguous
    const isContiguous = sorted.every((val, i) => {
        if (i === 0) return true;
        return parseInt(val) === parseInt(sorted[i - 1]) + 1;
    });

    if (isContiguous && sorted.length > 2) {
        return `${getDayLabel(sorted[0])} - ${getDayLabel(sorted[sorted.length - 1])}`;
    }
    return sorted.map(d => getDayLabel(d)).join(", ");
};

// --- DATA TRANSFORMATION LOGIC (Zero Trust) ---

// 1. Convert Time Object to Minutes from Midnight
const toMinutes = (t: Time): number => {
    let h = parseInt(t.hour);
    const m = parseInt(t.minute);

    if (t.ampm === "PM" && h !== 12) h += 12;
    if (t.ampm === "AM" && h === 12) h = 0;

    return (h * 60) + m;
};

// 2. Map Index "0" to "MONDAY"
const DAY_MAP: Record<string, DayParams> = {
    "0": "MONDAY", "1": "TUESDAY", "2": "WEDNESDAY", "3": "THURSDAY", "4": "FRIDAY", "5": "SATURDAY", "6": "SUNDAY"
}

// 3. Transform UI Blocks -> Strict Backend Array (7 items)
const transformSchedule = (blocks: ScheduleBlock[]): BackendScheduleItem[] => {
    const result: BackendScheduleItem[] = [];
    const processedDays = new Set<string>();

    blocks.forEach(block => {
        block.days.forEach(dayIdx => {
            if (processedDays.has(dayIdx)) return; // Prevent overwrites if UI allows overlaps (though better to validate)
            processedDays.add(dayIdx);

            result.push({
                day: DAY_MAP[dayIdx],
                openMinutes: block.isOpen ? toMinutes(block.open) : 0,
                closeMinutes: block.isOpen ? toMinutes(block.close) : 0,
                isClosed: !block.isOpen
            });
        });
    });

    // Fill missing days as CLOSED
    dayList.forEach(idx => {
        if (!processedDays.has(idx)) {
            result.push({
                day: DAY_MAP[idx],
                openMinutes: 0,
                closeMinutes: 0,
                isClosed: true
            });
        }
    });

    return result;
};


// --- Components ---

// Validar que el src de la imagen sea seguro para next/image
const isValidImageSrc = (src?: string | null) => {
    if (!src) return false;
    return src.startsWith("http") || src.startsWith("blob:");
};

// 1. Image Upload
const ImageUpload = ({ name, label, shape = "circle", initialPreview, onChange }: any) => {
    const [preview, setPreview] = useState<string | null>(initialPreview || null);

    // D. Cleanup Effect (Liberar memoria)
    useEffect(() => {
        return () => {
            if (preview?.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // A. File Size Check (5MB)
            if (file.size > 5 * 1024 * 1024) {
                // B. Contextual Error Message
                alert(`${label}: Reduce su tamaño a 5 MB o menos para subirla.`);
                e.target.value = ""; // Clear input
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            if (onChange) onChange(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        setPreview(null);
        if (onChange) onChange(null);
    };

    const isCircle = shape === "circle";
    const containerClass = isCircle ? "w-28 h-28 rounded-full" : "w-full h-32 rounded-xl bg-white/[0.03]";

    return (
        <div className="flex flex-col gap-2 items-center w-full">
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            </div>
            <label className={`
                relative group cursor-pointer border-2 border-dashed border-gray-700 hover:border-[#E5CB67] transition-all duration-300 flex items-center justify-center overflow-hidden
                ${containerClass}
                ${preview ? "border-solid border-[#E5CB67]/50" : ""}
            `}>
                <input type="file" name={name} accept="image/*" onChange={handleFileChange} className="hidden" />
                {preview && isValidImageSrc(preview) ? (
                    <>
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            unoptimized={preview.startsWith("blob:")}
                            className="object-cover"
                        />
                        <button onClick={handleRemove} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-500/80 transition-colors z-10"><X size={12} /></button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-[#E5CB67] transition-colors">
                        <Camera size={isCircle ? 20 : 24} />
                        <span className="text-[9px] font-bold uppercase">Subir</span>
                    </div>
                )}
            </label>
        </div>
    );
};

// 2. Time Wheel Picker
const TimeWheelPicker = ({ value, onChange, onInteractionStart, onInteractionEnd }: { value: Time, onChange: (v: Time) => void, onInteractionStart?: () => void, onInteractionEnd?: () => void }) => {
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];
    const ampms: ("AM" | "PM")[] = ["AM", "PM"];

    // Haptic Utility
    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10); // Crisp 10ms tap
        }
    };

    const Column = ({ options, val, setVal, width = "w-10" }: any) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const isScrollingRef = useRef(false);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        // Sync External Value -> Scroll Position
        useEffect(() => {
            if (containerRef.current && !isScrollingRef.current) {
                const index = options.indexOf(val);
                if (index !== -1) {
                    // Check if we are already there (approx) to avoid jitter
                    const currentScroll = containerRef.current.scrollTop;
                    const targetScroll = index * 32;
                    if (Math.abs(currentScroll - targetScroll) > 10) {
                        containerRef.current.scrollTo({
                            top: targetScroll,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }, [val, options]);

        const handleScroll = () => {
            if (!containerRef.current) return;
            isScrollingRef.current = true;

            // Clear timeout to reset scrolling flag
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                isScrollingRef.current = false;
            }, 150);

            const scrollTop = containerRef.current.scrollTop;
            const index = Math.round(scrollTop / 32); // item height = 32px (h-8)
            const safeIndex = Math.max(0, Math.min(index, options.length - 1));
            const newValue = options[safeIndex];

            // Only update if value changed (Snap Logic)
            if (newValue !== val) {
                triggerHaptic();
                setVal(newValue);
            }
        };

        return (
            <div
                ref={containerRef}
                className={`h-24 overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center py-8 relative group ${width}`}
                onScroll={handleScroll}
                onTouchStart={onInteractionStart}
                onTouchEnd={onInteractionEnd}
                onMouseDown={onInteractionStart}
                onMouseUp={onInteractionEnd}
                onMouseLeave={onInteractionEnd}
            >
                {options.map((opt: string) => (
                    <div
                        key={opt}
                        onClick={() => {
                            triggerHaptic();
                            setVal(opt);
                        }}
                        className={`
                            h-8 flex-shrink-0 w-full flex items-center justify-center snap-center cursor-pointer text-sm transition-all duration-200
                            ${opt === val
                                ? "font-bold text-[#E5CB67] scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] z-10"
                                : "font-normal text-gray-500 scale-90 opacity-60 hover:text-gray-300"}
                        `}
                    >
                        {opt}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex justify-between items-center bg-[#1E1E1E]/50 rounded-xl border border-white/5 h-28 overflow-hidden relative w-full max-w-[220px] px-4 mx-auto select-none">
            {/* Center Highlight */}
            <div className="absolute top-1/2 left-2 right-2 h-9 -translate-y-1/2 border-y border-[#E5CB67]/10 bg-[#E5CB67]/5 pointer-events-none rounded-md backdrop-blur-[1px] z-0"></div>

            {/* Columns with explicit widths and separation */}
            <div className="z-10 flex items-center justify-between w-full">
                <Column options={hours} val={value.hour} setVal={(v: string) => onChange({ ...value, hour: v })} width="w-10" />

                <span className="text-white/40 text-lg font-medium pb-1 mx-1">:</span>

                <Column options={minutes} val={value.minute} setVal={(v: string) => onChange({ ...value, minute: v })} width="w-10" />

                {/* Spacer */}
                <div className="w-4"></div>

                <Column options={ampms} val={value.ampm} setVal={(v: any) => onChange({ ...value, ampm: v })} width="w-12" />
            </div>
        </div>
    )
}

// 3. Digital Clock Display
const DigitalTimeDisplay = ({ time, colorClass = "text-white" }: { time: Time, colorClass?: string }) => (
    <div className={`flex items-baseline gap-1 font-bold ${colorClass}`}>
        <span className="text-2xl tracking-tight">
            {formatHourPretty(time.hour)}:{time.minute}
        </span>
        <span className="text-xs font-medium opacity-60 uppercase">
            {time.ampm}
        </span>
    </div>
);

// 4. Smart Schedule Sheet (iOS Style)
const ScheduleModal = ({ isOpen, onClose, onSave, initialBlock }: any) => {
    const [days, setDays] = useState<string[]>([]);
    const [isOpenStatus, setIsOpenStatus] = useState(true);
    const [open, setOpen] = useState<Time>({ hour: '09', minute: '00', ampm: 'AM' });
    const [close, setClose] = useState<Time>({ hour: '07', minute: '00', ampm: 'PM' });

    // Focus Mode Logic
    const [isInteracting, setIsInteracting] = useState(false);

    useEffect(() => {
        if (isOpen && initialBlock) {
            setDays(initialBlock.days);
            setIsOpenStatus(initialBlock.isOpen);
            setOpen(initialBlock.open);
            setClose(initialBlock.close);
        } else if (isOpen && !initialBlock) {
            setDays([]);
            setIsOpenStatus(true);
        }
    }, [isOpen, initialBlock]);

    const toggleDay = (d: string) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
                    {/* NO OVERLAY - Just the sheet sliding up "physically" */}

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="pointer-events-auto w-full max-w-2xl bg-gradient-to-b from-zinc-800/95 to-zinc-950/95 backdrop-blur-2xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[85vh] flex flex-col border-t border-white/10 relative overflow-hidden"
                    >
                        {/* 1. Native Header (Fixed) */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-transparent z-20 shrink-0">
                            <button
                                onClick={onClose}
                                className="text-base text-gray-400 font-medium hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <h3 className="text-lg font-bold text-white tracking-wide">Configurar Horario</h3>
                            <div className="w-[60px]"></div> {/* Spacer for balance */}
                        </div>

                        {/* 2. Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8">

                            {/* Días */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Días Aplicables</label>
                                <div className="flex justify-between md:justify-around bg-black/20 p-3 rounded-2xl border border-white/5 gap-1">
                                    {dayList.map(d => {
                                        const shortLabel = ["L", "M", "M", "J", "V", "S", "D"][parseInt(d)];
                                        return (
                                            <motion.button
                                                key={d}
                                                type="button"
                                                onClick={() => toggleDay(d)}
                                                whileTap={{ scale: 0.85 }}
                                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full text-sm font-bold transition-all flex items-center justify-center ${days.includes(d)
                                                    ? "bg-[#E5CB67] text-black shadow-lg shadow-[#E5CB67]/20"
                                                    : "text-gray-500 hover:bg-white/10"
                                                    }`}
                                            >
                                                {shortLabel}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Toggle Estado */}
                            <div className="bg-black/20 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${isOpenStatus ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                        <Power size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold text-white mb-0.5">
                                            {isOpenStatus ? "Abierto al público" : "Cerrado"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {isOpenStatus ? "Horario habilitado para reservas." : "No se aceptarán reservas este día."}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsOpenStatus(!isOpenStatus)}
                                    className={`w-14 h-8 rounded-full transition-colors relative ${isOpenStatus ? "bg-[#E5CB67]" : "bg-gray-700"}`}
                                >
                                    <motion.div
                                        animate={{ x: isOpenStatus ? 24 : 4 }}
                                        className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-md"
                                    />
                                </button>
                            </div>

                            {/* Selectores de Hora */}
                            <AnimatePresence>
                                {isOpenStatus && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4">
                                            <div className="flex items-center justify-center gap-10 mb-8">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-[#E5CB67] uppercase mb-2">Apertura</span>
                                                    <DigitalTimeDisplay time={open} colorClass="text-3xl text-white" />
                                                </div>
                                                <span className="text-gray-700 text-3xl font-light">→</span>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-[#E5CB67] uppercase mb-2">Cierre</span>
                                                    <DigitalTimeDisplay time={close} colorClass="text-3xl text-[#E5CB67]" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 place-items-center bg-black/10 rounded-3xl p-6 border border-white/5">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-xs text-gray-500 font-bold uppercase">Abre</span>
                                                    <TimeWheelPicker
                                                        value={open}
                                                        onChange={setOpen}
                                                        onInteractionStart={() => setIsInteracting(true)}
                                                        onInteractionEnd={() => setIsInteracting(false)}
                                                    />
                                                </div>
                                                <div className="w-full h-px bg-white/5 md:hidden"></div>
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-xs text-gray-500 font-bold uppercase">Cierra</span>
                                                    <TimeWheelPicker
                                                        value={close}
                                                        onChange={setClose}
                                                        onInteractionStart={() => setIsInteracting(true)}
                                                        onInteractionEnd={() => setIsInteracting(false)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 3. Sticky Action Button (Focus Mode) */}
                        {/* 3. Sticky Action Button (Focus Mode) */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-30">
                            <motion.button
                                type="button"
                                animate={{ opacity: isInteracting ? 0.3 : 1, scale: isInteracting ? 0.98 : 1 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => {
                                    if (days.length === 0) return;
                                    onSave({ id: initialBlock?.id || crypto.randomUUID(), days, isOpen: isOpenStatus, open, close });
                                }}
                                disabled={days.length === 0}
                                className={`w-full py-5 rounded-full text-black text-lg font-bold transition-all shadow-xl shadow-[#E5CB67]/10 flex items-center justify-center gap-2
                                    ${days.length > 0 ? "bg-[#E5CB67] hover:bg-[#d4b95e]" : "bg-gray-800 text-gray-500 cursor-not-allowed"}
                                `}
                            >
                                <Clock size={20} className={days.length > 0 ? "text-black" : "text-gray-500"} />
                                {days.length > 0 ? "Guardar Horario" : "Selecciona un día"}
                            </motion.button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// --- Main Page Client ---

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
    const router = useRouter();
    const [logo, setLogo] = useState<File | null>(null);
    const [facade, setFacade] = useState<File | null>(null);
    const [interior, setInterior] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [showInfoPopover, setShowInfoPopover] = useState(false);

    // Smart Schedule State
    const [schedules, setSchedules] = useState<ScheduleBlock[]>([
        // 1. Semana Laboral (Martes a Viernes) - Extendido post-oficina
        {
            id: "default-workweek",
            days: ["1", "2", "3", "4"], // Mar, Mié, Jue, Vie
            isOpen: true,
            open: { hour: '09', minute: '00', ampm: 'AM' },
            close: { hour: '08', minute: '00', ampm: 'PM' }
        },
        // 2. Sábado (Día Pico) - Mismo horario o flexible
        {
            id: "default-saturday",
            days: ["5"], // Sáb
            isOpen: true,
            open: { hour: '09', minute: '00', ampm: 'AM' },
            close: { hour: '08', minute: '00', ampm: 'PM' }
        },
        // 3. Domingo (Horario Reducido)
        {
            id: "default-sunday",
            days: ["6"], // Dom
            isOpen: true,
            open: { hour: '10', minute: '00', ampm: 'AM' },
            close: { hour: '06', minute: '00', ampm: 'PM' }
        },
        // 4. Lunes (Día de Descanso)
        {
            id: "default-monday",
            days: ["0"], // Lun
            isOpen: false,
            open: { hour: '09', minute: '00', ampm: 'AM' },
            close: { hour: '06', minute: '00', ampm: 'PM' }
        }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSaveBlock = (block: ScheduleBlock) => {
        setSchedules(prev => {
            const exists = prev.find(p => p.id === block.id);
            if (exists) return prev.map(p => p.id === block.id ? block : p);
            return [...prev, block];
        });
        setIsModalOpen(false);
    };

    const handleDeleteBlock = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSchedules(prev => prev.filter(p => p.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validation (Frontal feedback only)
            if (!logo && !initialLogo) throw new Error("Debes subir el logo de tu negocio.");
            if (schedules.length === 0) throw new Error("Define al menos un horario.");

            const formData = new FormData();

            // Append files directly if they exist
            if (logo) formData.append('logo', logo);
            if (facade) formData.append('facadePhoto', facade);
            if (interior) formData.append('interiorPhoto', interior);
            formData.append('description', description);

            // DATA TRANSFORMATION: UI Blocks -> Backend Strict Array
            const backendSchedule = transformSchedule(schedules);
            formData.append('schedules', JSON.stringify(backendSchedule));

            // Execute Server Action
            const result = await saveVisualIdentity(formData);
            if (result?.error) throw new Error(result.error);
            router.push('/create-barbershop/staff-count');
        } catch (err: any) {
            setError(err.message || "Error al guardar.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black text-gray-200 font-sans">
            <div className="w-full max-w-lg md:max-w-2xl mx-auto px-6 py-8 animate-fade-in flex flex-col min-h-screen transition-all duration-300">

                <div className="flex items-center justify-between mb-4">
                    <Link href="/create-barbershop/location-contact" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Paso 3 de 5</span>
                    <div className="w-8"></div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Identidad Visual</h1>
                    <p className="text-gray-500 text-sm mt-2">Tu presencia ante los clientes.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">

                    {/* Logo & Photos Grid - Responsive */}
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="scale-110 md:scale-125 transition-transform">
                                <ImageUpload name="logo" label="Logo" shape="circle" initialPreview={initialLogo} onChange={setLogo} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <ImageUpload name="facadePhoto" label="Fachada" shape="rectangle" onChange={setFacade} />
                            <ImageUpload name="interiorPhoto" label="Interior" shape="rectangle" onChange={setInterior} />
                        </div>
                    </div>


                    {/* Info Trigger & Popover */}
                    <div className="relative z-20 flex justify-start">
                        <button
                            type="button"
                            onClick={() => setShowInfoPopover(!showInfoPopover)}
                            className="flex items-center gap-3 group outline-none"
                        >
                            <span className="text-xs font-medium tracking-wide text-[#E5CB67] transition-opacity group-hover:opacity-80">Requisitos de imagen</span>
                            <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(229,203,103,0.4)] ${showInfoPopover ? "bg-[#E5CB67] border-[#E5CB67] text-black" : "bg-[#E5CB67]/10 border-[#E5CB67]/50 text-[#E5CB67] group-hover:bg-[#E5CB67] group-hover:text-black"}`}>
                                <Info size={12} />
                            </div>
                        </button>

                        <AnimatePresence>
                            {showInfoPopover && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 10, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute left-0 top-full w-72 md:w-96 p-4 bg-zinc-900/95 backdrop-blur-md rounded-xl border border-[#E5CB67]/30 shadow-xl z-50 text-xs text-gray-300 leading-relaxed"
                                >
                                    Optimizado para una carga rápida y segura. Cada imagen puede tener hasta <strong className="text-white">5 MB</strong>.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-full h-px bg-white/5"></div>

                    {/* Responsive Double Column Grid for Tablet */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descripción</label>
                            <textarea
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="¿Qué hace especial a tu barbería?"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 focus:border-[#E5CB67] outline-none transition-colors h-32 resize-none"
                            />
                        </div>

                        {/* Smart Schedule List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-[#E5CB67]" />
                                    <label className="text-xs font-bold text-gray-500 uppercase">Horarios</label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setEditingBlock(null); setIsModalOpen(true); }}
                                    className="text-xs text-[#E5CB67] font-bold hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> Agregar
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                {schedules.map((block) => (
                                    <motion.div
                                        key={block.id}
                                        layoutId={block.id}
                                        onClick={() => { setEditingBlock(block); setIsModalOpen(true); }}
                                        className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-white/30 hover:bg-white/[0.06] transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${block.isOpen ? "bg-[#E5CB67]" : "bg-gray-700"}`} />
                                        <div className="flex items-center gap-4 pl-2">
                                            <div className={`p-2 rounded-xl ${block.isOpen ? "bg-[#E5CB67]/10 text-[#E5CB67]" : "bg-gray-800 text-gray-500"}`}>
                                                <Calendar size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white leading-tight mb-0.5">
                                                    {formatDayRange(block.days)}
                                                </span>
                                                {block.isOpen ? (
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {formatTime(block.open)} - {formatTime(block.close)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider bg-red-900/20 px-2 py-0.5 rounded-full w-fit">
                                                        Cerrado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => handleDeleteBlock(e, block.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors z-10"><Trash2 size={16} /></button>
                                            <div className="p-2 text-gray-500 group-hover:text-white transition-colors"><Edit2 size={16} /></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs text-center">{error}</div>}

                    <div className="mt-auto pt-8 flex justify-center pb-8">
                        <button type="submit" disabled={loading} className="w-16 h-16 md:w-20 md:h-20 bg-[#E5CB67] rounded-full flex items-center justify-center text-black shadow-lg shadow-[#E5CB67]/30 hover:scale-110 active:scale-90 transition-all duration-300 disabled:opacity-50 disabled:scale-100">
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={28} strokeWidth={2.5} />}
                        </button>
                    </div>

                </form>
            </div >
            <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveBlock} initialBlock={editingBlock} />
        </div >
    );
}
