"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterLogic() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "register");

        // Zero Trust Validation:
        // We ensure 'intent' is present for UI context, defaulting to 'client' if missing.
        // We DO NOT trust this for role assignment, only for visual guidance.
        if (!params.has("intent")) {
            params.set("intent", "client");
        }

        // Perform the redirect to the Unified Auth page
        router.replace(`/login?${params.toString()}`);
    }, [router, searchParams]);

    // Return empty black screen while redirecting to maintain "Premium" feel (no white flash)
    return <div className="min-h-screen bg-black" />;
}
