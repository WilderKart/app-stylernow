export default function SuspendedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
            <div className="text-6xl mb-4">⛔</div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Servicio Suspendido</h1>
            <p className="text-gray-600 max-w-md">
                Hemos detectado un inconveniente con tu suscripción o pagos pendientes.
                El acceso a tu panel de gestión y la visibilidad de tu barbería han sido pausados temporalmente.
            </p>
            <div className="mt-8">
                <button className="bg-black text-white px-6 py-3 rounded-full font-bold">
                    Pagar Pendientes
                </button>
            </div>
            <p className="mt-4 text-xs text-gray-400">Si crees que es un error, contacta a soporte.</p>
        </div>
    )
}
