import Link from 'next/link'

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
            <p className="text-center mb-8">No tienes permisos para ver esta página.</p>
            <Link href="/login" className="bg-black text-white px-4 py-2 rounded">
                Ir al Login
            </Link>
        </div>
    )
}
