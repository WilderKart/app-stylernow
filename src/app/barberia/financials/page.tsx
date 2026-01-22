import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FinancialsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get My Barberia
    const { data: barberia } = await supabase.from('barberias').select('id, name, owner_id').eq('owner_id', user.id).single()
    if (!barberia) return <div>No tienes barbería registrada.</div>

    // Get Subscription Status
    const { data: subscription } = await supabase.from('subscriptions').select('*, plans(name, price)').eq('user_id', user.id).single()

    // Get Pending Commissions & History
    const { data: commissions } = await supabase.from('commissions')
        .select('id, amount, status, created_at, method')
        .eq('barberia_id', barberia.id)
        .order('created_at', { ascending: false })


    const pendingCommissions = commissions?.filter(c => c.status === 'PENDING') || []
    const totalDebt = pendingCommissions.reduce((sum, c) => sum + Number(c.amount), 0)

    // Block Logic Visual Check
    const isBlocked = subscription?.status !== 'active' // Simplified check. Or check debt threshold.

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-6 shadow-sm border-b mb-6">
                <h1 className="text-xl font-bold">Estado de Cuenta</h1>
                <p className="text-gray-500 text-sm">{barberia.name}</p>
            </header>

            <div className="px-4 space-y-6">
                {isBlocked && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 flex items-start gap-3">
                        <span className="text-2xl">⛔</span>
                        <div>
                            <h3 className="font-bold">Servicio Suspendido</h3>
                            <p className="text-sm">Tu suscripción no está activa. Los clientes no pueden ver tu barbería ni agendar citas.</p>
                        </div>
                    </div>
                )}

                {/* Subscription Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Tu Plan</h2>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="text-2xl font-bold block">{subscription?.plans?.name || 'Sin Plan'}</span>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${subscription?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {subscription?.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="block text-xl font-bold">${Number(subscription?.plans?.price || 0).toLocaleString()}</span>
                            <span className="text-gray-400 text-xs">/ mes</span>
                        </div>
                    </div>

                    {/* Pay Button - Goes to Wompi for Subscription Payment */}
                    {/* For Phase 3 MVP: We simulate link or just show button */}
                    <button className="w-full bg-black text-white py-3 rounded-lg font-bold">
                        Gestionar Suscripción
                    </button>
                </div>

                {/* Commissions Debt Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Comisiones Pendientes (30%)</h2>
                    <p className="text-gray-400 text-xs mb-4">
                        Cargos acumulados por nuevos clientes. Se cobrarán en tu próxima factura.
                    </p>

                    <div className="flex justify-between items-end border-t pt-4">
                        <span className="font-bold text-3xl">${totalDebt.toLocaleString()}</span>
                        <span className="text-gray-500 font-medium">Total a Pagar</span>
                    </div>
                </div>

                {/* Ledger / Transaction History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Historial de Transacciones</h2>
                    </div>
                    <div>
                        {commissions && commissions.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Concepto</th>
                                        <th className="px-6 py-3 text-right">Monto</th>
                                        <th className="px-6 py-3 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissions.map((comm) => (
                                        <tr key={comm.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                {new Date(comm.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                Comisión Nuevo Cliente
                                                <span className="block text-xs text-gray-400">{comm.method || 'Automático'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                ${Number(comm.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${comm.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                        comm.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {comm.status === 'PENDING' ? 'PENDIENTE' :
                                                        comm.status === 'PAID' ? 'PAGADO' : comm.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-6 text-gray-400 text-center">No hay movimientos registrados.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
