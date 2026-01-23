import { Suspense } from "react";
import RegisterLogic from "@/components/auth/RegisterLogic";

// Explicitly opt-out of static generation for this auth gateway
export const dynamic = 'force-dynamic';

export default function RegisterRedirect() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <RegisterLogic />
        </Suspense>
    );
}
