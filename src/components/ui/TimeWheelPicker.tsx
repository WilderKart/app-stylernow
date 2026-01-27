"use client";

import { useRef, useState, useEffect } from "react";

interface TimeWheelPickerProps {
    value: string; // Format "HH:mm" (24h) or "hh:mm a"
    onChange: (time: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

export default function TimeWheelPicker({ value, onChange }: TimeWheelPickerProps) {
    // Parse initial value (Assuming "hh:mm a" or "HH:mm")
    // Simple parser for "09:00 AM" format
    const [hour, setHour] = useState("09");
    const [minute, setMinute] = useState("00");
    const [period, setPeriod] = useState("AM");

    useEffect(() => {
        if (value) {
            const parts = value.split(/[:\s]/); // split by colon or space
            if (parts.length >= 2) {
                setHour(parts[0]);
                setMinute(parts[1]);
                if (parts.length > 2) setPeriod(parts[2]);
            }
        }
    }, [value]);

    const handleChange = (h: string, m: string, p: string) => {
        setHour(h);
        setMinute(m);
        setPeriod(p);
        onChange(`${h}:${m} ${p}`);
    };

    return (
        <div className="flex bg-[#1A1A1A] rounded-xl border border-gray-800 h-32 relative overflow-hidden text-center select-none">
            {/* Selection Highlight */}
            <div className="absolute top-1/2 left-0 w-full h-10 -translate-y-1/2 bg-[#E5CB67]/10 border-t border-b border-[#E5CB67]/30 pointer-events-none z-0" />

            {/* Hours */}
            <div className="flex-1 overflow-y-scroll no-scrollbar snap-y snap-mandatory py-11 relative z-10 text-white">
                {HOURS.map((h) => (
                    <div
                        key={h}
                        onClick={() => handleChange(h, minute, period)}
                        className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-colors ${hour === h ? 'text-[#E5CB67] font-bold text-xl' : 'text-gray-500 text-sm'}`}
                    >
                        {h}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center text-gray-500 relative z-10 font-bold">:</div>

            {/* Minutes */}
            <div className="flex-1 overflow-y-scroll no-scrollbar snap-y snap-mandatory py-11 relative z-10 text-white">
                {MINUTES.map((m) => (
                    <div
                        key={m}
                        onClick={() => handleChange(hour, m, period)}
                        className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-colors ${minute === m ? 'text-[#E5CB67] font-bold text-xl' : 'text-gray-500 text-sm'}`}
                    >
                        {m}
                    </div>
                ))}
            </div>

            {/* Period */}
            <div className="flex-1 overflow-y-scroll no-scrollbar snap-y snap-mandatory py-11 relative z-10 text-white bg-black/20">
                {PERIODS.map((p) => (
                    <div
                        key={p}
                        onClick={() => handleChange(hour, minute, p)}
                        className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-colors ${period === p ? 'text-white font-bold text-base' : 'text-gray-600 text-xs'}`}
                    >
                        {p}
                    </div>
                ))}
            </div>
        </div>
    );
}
