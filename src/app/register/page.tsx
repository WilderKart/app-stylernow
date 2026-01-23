"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterLogic() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "register");
        if (!params.has("intent")) {
            params.set("intent", "client"); // Default fallback if accessed directly
        }
        router.replace(`/login?${params.toString()}`);
    }, [router, searchParams]);

    return <div className="min-h-screen bg-black" />;
}

export default function RegisterRedirect() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <RegisterLogic />
        </Suspense>
    );
}
