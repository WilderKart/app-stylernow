"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Clock,
    Scissors,
    Users,
    Calendar,
    User,
    DollarSign,
    BarChart3,
    Lock,
    Menu,
    X
} from "lucide-react";

export default function DashboardShell({ children, userName }: { children: React.ReactNode, userName: string }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: "Servicios", href: "/dashboard/services", icon: Scissors, active: true },
        { name: "Equipo", href: "/dashboard/staff", icon: Users, active: true },
        { name: "Agenda", href: "/dashboard/agenda", icon: Calendar, active: true }, // Logic to come later? Or just placeholder
        { name: "Perfil", href: "/dashboard/profile", icon: User, active: true },
        { name: "Finanzas", href: "#", icon: DollarSign, active: false },
        { name: "Marketing", href: "#", icon: BarChart3, active: false },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FF8A00] selection:text-black">
            {/* 1. Sticky Banner */}
            <div className="sticky top-0 z-50 bg-[#FF8A00]/10 backdrop-blur-md border-b border-[#FF8A00]/20 text-[#FF8A00] text-xs md:text-sm py-2 px-4 flex items-center justify-center gap-2 font-medium">
                <Clock size={16} className="animate-pulse" />
                <span>Tu cuenta está en validación. Configura tu menú y equipo mientras esperas.</span>
            </div>

            <div className="flex h-[calc(100vh-40px)]">
                {/* 2. Sidebar (Desktop) */}
                <aside className="hidden md:flex flex-col w-64 bg-[#050505] border-r border-white/5 h-full">
                    {/* Brand */}
                    <div className="p-6 border-b border-white/5">
                        <h1 className="text-xl font-bold tracking-widest text-white">STYLER<span className="text-[#FF8A00]">NOW</span></h1>
                        <p className="text-xs text-gray-500 mt-1 truncate">{userName}</p>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            if (!item.active) {
                                return (
                                    <div key={item.name} className="flex items-center gap-3 px-4 py-3 text-gray-600 cursor-not-allowed group">
                                        <Icon size={20} />
                                        <span className="text-sm font-medium">{item.name}</span>
                                        <Lock size={14} className="ml-auto opacity-50" />
                                    </div>
                                )
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive ? 'bg-[#FF8A00] text-black font-bold shadow-[0_0_15px_rgba(255,138,0,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Icon size={20} className={isActive ? "scale-110" : "group-hover:scale-110 transition-transform"} />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User */}
                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">Mi Cuenta</p>
                                <p className="text-xs text-xs text-gray-500">Plan Básico</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* 3. Main Content */}
                <main className="flex-1 relative overflow-y-auto bg-black">
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur sticky top-0 z-30">
                        <h1 className="text-lg font-bold tracking-widest">STYLER<span className="text-[#FF8A00]">NOW</span></h1>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {mobileMenuOpen && (
                        <div className="md:hidden fixed inset-0 top-[95px] z-40 bg-black/95 backdrop-blur-xl p-4 flex flex-col gap-2 animate-fade-in">
                            {navItems.map((item) => (
                                item.active ? (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 p-4 rounded-xl text-lg font-medium ${pathname === item.href ? 'bg-[#FF8A00] text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                    >
                                        <item.icon size={24} />
                                        {item.name}
                                    </Link>
                                ) : (
                                    <div key={item.name} className="flex items-center gap-4 p-4 text-gray-600">
                                        <item.icon size={24} />
                                        {item.name}
                                        <Lock size={16} className="ml-auto" />
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
