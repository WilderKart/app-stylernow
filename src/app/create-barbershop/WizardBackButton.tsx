"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function WizardBackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Mapping of current path -> previous path
    // If not in this map or maps to null, button is hidden.
    const backRoutes: Record<string, string | null> = {
        "/create-barbershop/business-info": null, // Hidden on Step 1
        "/create-barbershop/location-contact": "/create-barbershop/business-info",
        "/create-barbershop/visual-identity": "/create-barbershop/location-contact",
        "/create-barbershop/staff-count": "/create-barbershop/visual-identity",
        "/create-barbershop/documents": "/create-barbershop/staff-count",
    };

    // Normalize pathname (remove trailing slashes if any, though Next.js usually normalizes)
    const currentPath = pathname?.replace(/\/$/, "") || "";

    // Check if we should show the button
    const previousRoute = backRoutes[currentPath];
    const isVisible = previousRoute !== undefined && previousRoute !== null;

    if (!isVisible) return null;

    const handleBack = () => {
        if (previousRoute) {
            router.push(previousRoute);
        } else {
            router.back();
        }
    };

    return (
        <div className="w-full max-w-lg md:max-w-xl flex justify-start mb-4">
            <button
                onClick={handleBack}
                className="group flex items-center justify-center w-10 h-10 rounded-full 
                           bg-white/5 backdrop-blur-md border border-white/10 
                           hover:bg-[#FF8A00] hover:border-[#FF8A00] transition-all duration-300
                           active:scale-95 shadow-lg shadow-black/20"
                aria-label="Volver"
            >
                <ChevronLeft
                    size={24}
                    className="text-gray-300 group-hover:text-black transition-colors duration-300 relative -ml-0.5"
                    strokeWidth={1.5}
                />
            </button>
        </div>
    );
}
