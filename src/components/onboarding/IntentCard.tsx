"use client";

import { ReactNode } from "react";

interface IntentCardProps {
    title: string;
    imageSrc: string;
    onClick: () => void;
    active?: boolean;
}

export default function IntentCard({ title, imageSrc, onClick, active }: IntentCardProps) {
    return (
        <button
            onClick={onClick}
            className={`
        w-full p-4 md:p-8 flex md:flex-col items-center justify-start md:justify-center rounded-3xl border-2 transition-all duration-300 group relative overflow-hidden
        min-h-[8rem] md:min-h-[16rem] lg:min-h-[20rem]
        ${active
                    ? "border-gold bg-[#1A1A1A]"
                    : "border-transparent bg-[#1A1A1A] hover:bg-[#252525]"
                }
      `}
        >
            {/* Image Container */}
            <div className="relative w-20 h-20 md:w-full md:h-48 lg:h-56 rounded-full md:rounded-2xl overflow-hidden border-2 border-transparent shrink-0 transition-transform duration-300 group-hover:scale-105">
                <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Title */}
            <div className="ml-4 md:ml-0 md:mt-6 flex-1 md:flex-none text-left md:text-center">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                    {title}
                </h3>
            </div>
        </button>
    );
}
