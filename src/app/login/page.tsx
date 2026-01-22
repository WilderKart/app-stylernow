'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.refresh()
            // Router refresh might not trigger middleware redirect immediately if client-side nav?
            // Better to hard reload or push to root and let middleware handle it
            router.push('/')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-8">Iniciar Sesión</h1>
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-3 rounded bg-gray-50"
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-3 rounded bg-gray-50"
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white p-3 rounded font-bold disabled:opacity-50"
                >
                    {loading ? 'Cargando...' : 'Entrar'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <p className="text-gray-500">¿No tienes cuenta?</p>
                <a href="/register" className="font-bold text-black hover:underline">
                    Regístrate como Cliente
                </a>
            </div>
        </div>
    )
}
