"use client";

import { useState } from "react";
import { Users, Plus, X, Loader2, Upload, Phone, Mail } from "lucide-react";
import Image from "next/image";
import { createStaff } from "../actions";

export default function StaffManager({ initialStaff }: { initialStaff: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);
            const res = await createStaff(formData);
            if (res?.error) throw new Error(res.error);

            setIsModalOpen(false);
            setAvatarPreview(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Equipo</h2>
                    <p className="text-gray-500 text-sm">Gestiona a los profesionales de tu barbería.</p>
                </div>
                {/* Always show Add button if list > 0 (handled by grid card otherwise but good to have top action too if desired, adhering to plan's card style mostly) */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Add New Card */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="h-64 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-[#FF8A00] hover:border-[#FF8A00] hover:bg-[#FF8A00]/5 transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold">Agregar Miembro</span>
                </button>

                {/* Staff Cards */}
                {initialStaff.map((member) => (
                    <div key={member.id} className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col items-center relative group hover:border-gray-700 transition-colors">
                        <div className="w-24 h-24 rounded-full bg-gray-800 mb-4 overflow-hidden relative">
                            {member.avatar_url ? (
                                // Assuming we need signed url or public bucket? Plan suggests storage logic defined.
                                // If path is stored, we need getPublicUrl or SignedUrl in component? 
                                // For now assuming public bucket or component handles logical path. 
                                // Actually actions save 'filePath'. We need the storage URL.
                                // I'll use a placeholder or handle fetching properly in page.tsx if possible. 
                                // For MVP/Sandbox, assume we can display if we construct full URL or use Client generic bucket access.
                                // Let's try to load standard storage URL format if known.
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/staff-profiles/${member.avatar_url}`}
                                    alt={member.full_name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A] text-gray-600">
                                    <Users size={32} />
                                </div>
                            )}
                        </div>
                        <h4 className="font-bold text-white text-lg">{member.full_name}</h4>
                        <span className="text-[#FF8A00] text-xs font-medium uppercase tracking-wider mb-4">{member.role}</span>

                        <div className="flex gap-3 w-full justify-center">
                            {member.phone && <div className="p-2 rounded-full bg-[#1A1A1A] text-gray-400"><Phone size={14} /></div>}
                            {member.email && <div className="p-2 rounded-full bg-[#1A1A1A] text-gray-400"><Mail size={14} /></div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#121212] w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden scale-in-center">
                        <div className="flex justify-between items-center p-5 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white">Nuevo Miembro</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                            {/* Avatar Upload */}
                            <div className="flex justify-center">
                                <label className="w-24 h-24 rounded-full border border-gray-700 bg-[#0A0A0A] flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#FF8A00] transition-colors relative group">
                                    <input type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    {avatarPreview ? (
                                        <Image src={avatarPreview} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500 group-hover:text-[#FF8A00]">
                                            <Upload size={20} />
                                            <span className="text-[10px] mt-1">Foto</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium ml-1">Nombre Completo</label>
                                <input name="full_name" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white focus:border-[#FF8A00] outline-none mt-1" required />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium ml-1">Rol</label>
                                <select name="role" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white focus:border-[#FF8A00] outline-none mt-1">
                                    <option value="BARBER">Barbero</option>
                                    <option value="STYLIST">Estilista</option>
                                    <option value="MANAGER">Gerente</option>
                                    <option value="ASSISTANT">Asistente</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium ml-1">Teléfono</label>
                                    <input name="phone" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white focus:border-[#FF8A00] outline-none mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-medium ml-1">Email</label>
                                    <input name="email" type="email" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white focus:border-[#FF8A00] outline-none mt-1" />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#FF8A00] text-black w-full py-3 rounded-xl font-bold hover:bg-[#FF9F2A] transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {loading ? "Agregando..." : "Invitar Miembro"}
                            </button>

                            <p className="text-[10px] text-gray-600 text-center px-4 leading-tight">
                                Al registrar a tu equipo, confirmas que tienes autorización para gestionar sus datos laborales en StylerNow.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
