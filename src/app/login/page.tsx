"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import GradientOverlay from '@/components/ui/GradientOverlay';

function UnifiedAuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Auth Mode: 'login' or 'register'
    const modeParam = searchParams.get('mode');
    const isRegister = modeParam === 'register';

    // Intent: 'owner' or 'client'
    const intentParam = searchParams.get('intent');
    const intent = (intentParam === 'owner' || intentParam === 'client') ? intentParam : null;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isRegister) {
                // REGISTER LOGIC
                if (!intent) {
                    throw new Error("Intención de registro no detectada. Por favor reinicia el proceso.");
                }

                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            signup_intent: intent, // Pass intent as metadata only (Zero Trust)
                        },
                    },
                });

                if (signUpError) throw signUpError;

                // Success for Register -> Usually verify email or auto-login
                // For this flow, we might redirect to a 'check email' page or dashboard if auto-confirmed
                router.push('/check-email'); // Or dashboard if configured to auto-confirm in dev
            } else {
                // LOGIN LOGIC
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                // Post-Login Verification:
                // Frontend should consult /me (or just rely on RLS/Middleware)
                // We refresh router to let Middleware/Layouts handle redirection based on Role
                router.refresh();
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        const newMode = isRegister ? 'login' : 'register';
        const params = new URLSearchParams(searchParams.toString());
        params.set('mode', newMode);
        router.replace(`?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 relative z-10">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 border border-gold rounded-full mb-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <span className="text-2xl">✂️</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-wide">
                    {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
                </h1>
                <p className="text-gold mt-2 uppercase text-sm tracking-widest font-bold">
                    {intent ? (intent === 'owner' ? 'Soy Profesional' : 'Soy Cliente') : 'StylerNow'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-off-black border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-off-black border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold text-pure-black py-4 rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:bg-gold-light transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Procesando...' : (isRegister ? 'REGISTRARME' : 'INICIAR SESIÓN')}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-text text-sm">
                    {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                </p>
                <button
                    onClick={toggleMode}
                    className="text-gold font-bold mt-2 hover:text-white transition-colors"
                >
                    {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
                </button>
            </div>

            {/* OAUTH PLACEHOLDERS (Visual only per instructions for now, functionality to be added) */}
            <div className="mt-10 pt-6 border-t border-gray-900">
                <div className="flex gap-4 justify-center">
                    <button className="w-12 h-12 rounded-full bg-off-black border border-gray-800 flex items-center justify-center hover:border-gold/50 transition-colors text-white">
                        <span className="text-xl">G</span>
                    </button>
                    <button className="w-12 h-12 rounded-full bg-off-black border border-gray-800 flex items-center justify-center hover:border-gold/50 transition-colors text-white">
                        <span className="text-xl"></span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-pure-black flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[30%] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

            <Suspense fallback={<div className="text-gold">Cargando...</div>}>
                <UnifiedAuthForm />
            </Suspense>
        </div>
    );
}
