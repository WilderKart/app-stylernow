import React from "react";
import Image from "next/image";

export default function CreateBarbershopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-pure-black relative overflow-hidden font-sans text-white">
            {/* Background Ambience */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[30%] bg-[#FF8A00]/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF8A00]/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-md md:max-w-4xl mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-screen">
                {children}
            </main>
        </div>
    );
}
