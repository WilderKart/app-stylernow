"use client";

import { ReactNode } from "react";

interface IntentCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    onClick: () => void;
    active?: boolean;
}

export default function IntentCard({ title, description, icon, onClick, active }: IntentCardProps) {
    return (
        <button
            onClick={onClick}
            className={`
        w-full p-6 text-left rounded-2xl border transition-all duration-300 group
        ${active
                    ? "border-gold bg-off-black shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    : "border-gray-800 bg-off-black/50 hover:border-gold/50 hover:bg-off-black"
                }
      `}
        >
            <div className={`
        mb-4 text-3xl transition-colors duration-300
        ${active ? "text-gold" : "text-gray-500 group-hover:text-gold-light"}
      `}>
                {icon}
            </div>

            <h3 className={`
        text-xl font-bold mb-2 transition-colors duration-300
        ${active ? "text-white" : "text-gray-200 group-hover:text-white"}
      `}>
                {title}
            </h3>

            <p className="text-gray-text text-sm leading-relaxed">
                {description}
            </p>
        </button>
    );
}
