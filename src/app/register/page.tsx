'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'client' // Default role
                }
            }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Ideally check if email confirmation is required.
            // For now assuming auto-confirm or proceeding.
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold mb-2">Crear Cuenta</h1>
                <p className="text-gray-500 mb-8">Únete a Stylernow para reservar.</p>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border p-4 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border p-4 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white p-4 rounded-xl font-bold disabled:opacity-50 mt-2 hover:scale-[1.02] transition-transform"
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-500">¿Ya tienes cuenta?</p>
                    <Link href="/login" className="font-bold text-black hover:underline">
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
