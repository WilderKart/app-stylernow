"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    const [showPassword, setShowPassword] = useState(false);
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
                            signup_intent: intent,
                        },
                    },
                });

                if (signUpError) throw signUpError;
                router.push('/check-email');
            } else {
                // LOGIN LOGIC
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;
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
        <div className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto p-6 md:p-12 relative z-10 bg-pure-black/50 backdrop-blur-sm rounded-3xl border border-white/5 shadow-2xl transition-all duration-300">
            {/* Logo Section - Centered and Responsive */}
            <div className="flex justify-center mb-4 md:mb-8">
                <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 transition-all duration-300">
                    <Image
                        src="/images/sn-logo.png"
                        alt="StylerNow Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className="text-center mb-6 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 transition-all">
                    {isRegister ? 'Crear Cuenta' : '¡Bienvenido de nuevo!'}
                </h1>
                <p className="text-gray-400 text-xs md:text-lg">
                    {isRegister
                        ? 'Ingresa tus datos para registrarte en StylerNow.'
                        : 'Ingresa tus credenciales para acceder a tu cuenta.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
                {/* Email Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs md:text-base font-medium text-white ml-1">Correo Electrónico</label>
                    <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-off-black border border-gray-800 rounded-xl p-3 md:p-5 text-sm md:text-lg text-white placeholder-gray-600 focus:border-[#E5CB67] focus:outline-none transition-colors"
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs md:text-base font-medium text-white ml-1">Contraseña</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-off-black border border-gray-800 rounded-xl p-3 md:p-5 text-sm md:text-lg text-white placeholder-gray-600 focus:border-[#E5CB67] focus:outline-none transition-colors pr-12"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Forgot Password Link - Only show in Login */}
                {!isRegister && (
                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-[#E5CB67] text-xs md:text-sm font-medium hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E5CB67] text-pure-black py-3 md:py-5 rounded-xl font-bold text-base md:text-xl shadow-[0_4px_20px_rgba(255,138,0,0.3)] hover:bg-[#FF9F2A] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed mt-1 md:mt-4"
                >
                    {loading ? 'Procesando...' : (isRegister ? 'Registrarme' : 'Iniciar Sesión')}
                </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-4 my-6 md:my-10">
                <div className="h-px bg-gray-800 flex-1"></div>
                <span className="text-gray-500 text-xs md:text-sm font-medium">O continúa con</span>
                <div className="h-px bg-gray-800 flex-1"></div>
            </div>

            {/* Google Sign In */}
            <button className="w-full bg-off-black border border-gray-700 text-white py-3 md:py-4 rounded-xl font-medium text-sm md:text-lg hover:bg-gray-800 hover:border-gray-600 transition-all flex items-center justify-center gap-3 group">
                {/* Google Icon SVG */}
                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.6z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                <span className="group-hover:text-white transition-colors">
                    {isRegister ? 'Registrarse con Google' : 'Iniciar sesión con Google'}
                </span>
            </button>

            {/* Footer */}
            <div className="mt-6 md:mt-10 text-center">
                <p className="text-gray-400 text-xs md:text-sm">
                    {isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={toggleMode}
                        className="text-[#E5CB67] font-bold ml-1.5 hover:underline transition-all"
                    >
                        {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-pure-black flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[30%] bg-[#E5CB67]/5 blur-[100px] rounded-full pointer-events-none" />

            <Suspense fallback={<div className="text-[#E5CB67]">Cargando...</div>}>
                <UnifiedAuthForm />
            </Suspense>
        </div>
    );
}
