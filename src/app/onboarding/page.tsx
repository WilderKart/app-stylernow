"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react"; // Boundary required for useSearchParams
import OnboardingCarousel, { OnboardingSlide } from "@/components/onboarding/OnboardingCarousel";

// Data Definitions (Simulated local source for Owner, could be fetched for Client)
const ownerSlides: OnboardingSlide[] = [
    {
        image: "/images/onboarding_loyalty.jpg",
        title: "Gestiona tu negocio",
        highlight: "sin límites",
        description: "Toma el control total de tu barbería. Gestiona citas, staff y finanzas desde un solo lugar."
    },
    {
        image: "/images/onboarding_business.jpeg",
        title: "Potencia tu",
        highlight: "equipo",
        description: "Organiza los horarios de tus barberos y optimiza la productividad de tu salón."
    },
    {
        image: "/images/onboarding_staff.jpg",
        title: "Fideliza a tus",
        highlight: "clientes",
        description: "Ofrece una experiencia de reserva premium que hará que tus clientes vuelvan siempre."
    }
];

const clientSlides: OnboardingSlide[] = [
    {
        image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
        title: "Encuentra tu",
        highlight: "estilo",
        description: "Descubre las mejores barberías cerca de ti y elige a los profesionales más destacados."
    },
    {
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
        title: "Reserva en",
        highlight: "segundos",
        description: "Olvídate de las llamadas. Reserva tu próxima cita en cualquier momento y lugar."
    },
    {
        image: "https://images.unsplash.com/photo-1599351431202-1e0f013dcec5?w=800&q=80",
        title: "Historial de",
        highlight: "cortes",
        description: "Lleva un registro de tus estilos favoritos y repite esa experiencia perfecta."
    }
];

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const intent = searchParams.get("intent") as "owner" | "client" | null;

    // Defaut to Client if no intent found (Safety fallback)
    const safeIntent = intent === "owner" ? "owner" : "client";
    const slides = safeIntent === "owner" ? ownerSlides : clientSlides;
    const ctaText = safeIntent === "owner" ? "Comenzar" : "Reservar";

    const handleComplete = () => {
        // Pass intent to Auth, explicitly
        router.push(`/login?mode=register&intent=${safeIntent}`);
    };

    return (
        <OnboardingCarousel
            slides={slides}
            ctaText={ctaText}
            onComplete={handleComplete}
            intent={safeIntent}
        />
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-pure-black flex items-center justify-center text-gold">Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    );
}
