"use client";

import { Suspense } from "react";
import RegisterLogic from "@/components/auth/RegisterLogic";

export default function RegisterRedirect() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <RegisterLogic />
        </Suspense>
    );
}
