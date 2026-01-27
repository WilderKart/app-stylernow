"use client";

import { useState } from "react";
import { uploadDocument, submitForReview } from "../actions";
import { FileText, CreditCard, Store, Camera, Upload, Check, ChevronLeft, Shield, Lock, UserCheck, X } from "lucide-react";
import CameraCapture from "@/components/ui/CameraCapture";

const DOC_CONFIG = {
    NATURAL: [
        { key: 'ID_CARD', label: 'Cédula de Ciudadanía', help: 'Formato: Foto/PDF', icon: CreditCard, hasCamera: true, sequential: ['FRONT', 'BACK'] },
        { key: 'SELFIE', label: 'Selfie con Cédula', help: 'Formato: Foto', icon: Camera, hasCamera: true }, // Simple photo
        { key: 'WORKSTATION', label: 'Puesto de Trabajo', help: 'Formato: Foto', icon: Store, hasCamera: true }
    ],
    JURIDICA: [
        { key: 'COMMERCE_CHAMBER', label: 'Cámara de Comercio', help: 'Formato: PDF (menor a 30 días)', icon: FileText, hasCamera: false },
        { key: 'LEGAL_REP_ID', label: 'Cédula Rep. Legal', help: 'Formato: Foto/PDF', icon: CreditCard, hasCamera: true, sequential: ['FRONT', 'BACK'] },
        { key: 'LOCALE_PHOTO', label: 'Foto Fachada Local', help: 'Formato: Imagen', icon: Store, hasCamera: true }
    ]
};

export default function DocumentsClient({
    barbershopId,
    businessType,
    existingDocs
}: {
    barbershopId: string,
    businessType: 'NATURAL' | 'JURIDICA',
    existingDocs: any[]
}) {
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>(
        existingDocs.reduce((acc, doc) => ({ ...acc, [doc.type]: true }), {})
    );
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    // Camera State
    const [cameraState, setCameraState] = useState<{
        active: boolean;
        docKey: string | null;
        step?: 'FRONT' | 'BACK';
    }>({ active: false, docKey: null });

    const requiredList = DOC_CONFIG[businessType] || DOC_CONFIG.NATURAL;
    const allUploaded = requiredList.every(doc => uploadedDocs[doc.key]);

    // Handle File Upload
    const handleFileUpload = async (file: File, docKey: string, sequentialType?: string) => {
        setLoading(docKey);
        setError(null);

        const formData = new FormData();
        let finalType = docKey;
        if (sequentialType) finalType = `${docKey}_${sequentialType}`;

        formData.append('file', file);
        formData.append('type', finalType);
        formData.append('barbershopId', barbershopId);

        try {
            const result = await uploadDocument(formData);
            if (result?.error) throw new Error(result.error);

            if (!sequentialType || sequentialType === 'BACK') {
                setUploadedDocs(prev => ({ ...prev, [docKey]: true }));
            }
        } catch (err: any) {
            console.error(err);
            setError(`Error subiendo: ${err.message}`);
        } finally {
            setLoading(null);
        }
    };

    // Camera Logic
    const openCamera = (docKey: string, isSequential = false) => {
        setCameraState({
            active: true,
            docKey,
            step: isSequential ? 'FRONT' : undefined
        });
    };

    const handleCapture = async (file: File) => {
        const { docKey, step } = cameraState;
        if (!docKey) return;

        await handleFileUpload(file, docKey, step);

        if (step === 'FRONT') {
            setCameraState(prev => ({ ...prev, step: 'BACK' }));
        } else {
            setCameraState({ active: false, docKey: null });
        }
    };

    const handleFinalSubmit = async () => {
        setLoading('FINAL');
        try {
            const res = await submitForReview(barbershopId);
            if (res?.error) throw new Error(res.error);
            window.location.href = `/welcome?status=review`;
        } catch (err: any) {
            setError(err.message);
            setLoading(null);
        }
    };

    return (
        <div className="w-full max-w-2xl lg:max-w-4xl animate-fade-in flex flex-col items-center px-4 md:px-0 mx-auto">
            {/* Camera Modal */}
            {cameraState.active && (
                <CameraCapture
                    onCapture={handleCapture}
                    onClose={() => setCameraState({ active: false, docKey: null })}
                    label={cameraState.step ? `Foto ${cameraState.step === 'FRONT' ? 'Frontal' : 'Posterior'}` : undefined}
                    instruction={cameraState.step === 'FRONT' ? "Tu foto debe ser clara y legible" : "Gira el documento"}
                />
            )}

            <div className="text-center mb-8 md:mb-12">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Documentación Legal
                </h1>
                <p className="text-[#A0A0A0] text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                    Para activar tu cuenta y recibir pagos, necesitamos verificar que eres real.
                    Tu información está encriptada.
                </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
                {requiredList.map((doc) => (
                    <div key={doc.key} className="bg-[#121212] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between gap-4 group hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-[#E5CB67]/5 h-full">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-900 rounded-xl text-white group-hover:text-[#E5CB67] transition-colors shrink-0">
                                <doc.icon size={28} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-bold text-white leading-tight">{doc.label}</span>
                                <span className="text-xs text-gray-500 font-medium">{doc.help}</span>

                                {uploadedDocs[doc.key] && (
                                    <div className="flex items-center gap-1 mt-2 text-green-500 bg-green-500/10 px-2 py-1 rounded w-fit">
                                        <Check size={12} strokeWidth={3} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Listo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-2 min-h-[60px] flex items-center justify-center">
                            {loading === doc.key ? (
                                <div className="flex flex-col items-center gap-2 animate-fade-in">
                                    <div className="w-6 h-6 rounded-full border-[2px] border-[#333] border-t-[#E5CB67] animate-spin" />
                                    <span className="text-[11px] text-gray-500 font-medium">Validando documento...</span>
                                </div>
                            ) : !uploadedDocs[doc.key] ? (
                                <div className="flex gap-3 w-full animate-fade-in">
                                    <label className="flex-1 cursor-pointer bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <Upload size={16} />
                                        Subir
                                        <input
                                            type="file"
                                            accept={doc.key.includes('PDF') ? "application/pdf,image/*" : "image/*"}
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handleFileUpload(e.target.files[0], doc.key);
                                            }}
                                            className="hidden"
                                            disabled={loading === doc.key}
                                        />
                                    </label>

                                    {doc.hasCamera && (
                                        <button
                                            onClick={() => openCamera(doc.key, !!doc.sequential)}
                                            className="flex-1 bg-[#E5CB67]/10 hover:bg-[#E5CB67]/20 text-[#E5CB67] text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-[#E5CB67]/20 active:scale-95"
                                        >
                                            <Camera size={16} />
                                            Cámara
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setUploadedDocs(prev => ({ ...prev, [doc.key]: false }))}
                                    className="w-full py-2.5 text-xs text-gray-500 hover:text-white transition-colors border-t border-gray-800/50 mt-2 flex items-center justify-center gap-1 group/edit animate-fade-in"
                                >
                                    <span>Editar</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-200 text-sm text-center mb-8 w-full max-w-lg flex items-center justify-center gap-3 backdrop-blur-sm">
                    <div className="w-8 h-8 rounded-full bg-red-800/30 flex items-center justify-center shrink-0">
                        <span className="text-lg">⚠️</span>
                    </div>
                    {error}
                </div>
            )}


            {/* Checkbox Legal - Replaces old static text */}
            <div className="max-w-4xl mx-auto mb-8 px-6 flex justify-center animate-fade-in">
                <label className="flex items-center gap-3 cursor-pointer group p-2">
                    <div className={`
                        w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300
                        ${isPolicyAccepted
                            ? 'bg-[#E5CB67] border-[#E5CB67] shadow-[0_0_10px_rgba(255,138,0,0.3)]'
                            : 'border-gray-600 group-hover:border-gray-400 bg-transparent'}
                    `}>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={isPolicyAccepted}
                            onChange={(e) => setIsPolicyAccepted(e.target.checked)}
                        />
                        {isPolicyAccepted && <Check size={14} strokeWidth={4} className="text-white" />}
                    </div>
                    <span className="text-xs text-gray-400 select-none">
                        Certifico que esta información es real y acepto las{' '}
                        <span
                            onClick={(e) => {
                                e.preventDefault();
                                setShowPolicyModal(true);
                            }}
                            className="text-[#E5CB67] font-bold hover:underline cursor-pointer"
                        >
                            Políticas de Seguridad.
                        </span>
                    </span>
                </label>
            </div>

            {/* Policy Modal */}
            {showPolicyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-black/50">
                        <button
                            onClick={() => setShowPolicyModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-[#E5CB67]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E5CB67]/20">
                                <Shield className="text-[#E5CB67]" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                Seguridad y Confianza StylerNow 🛡️
                            </h3>
                        </div>

                        <div className="space-y-6 text-sm text-gray-300 mb-8">
                            <div className="flex gap-3 text-left">
                                <div className="mt-1"><UserCheck size={18} className="text-[#E5CB67]" /></div>
                                <div>
                                    <strong className="block text-white mb-1">Tu identidad, protegida.</strong>
                                    <p className="text-gray-400 text-xs leading-relaxed">Para mantener nuestra comunidad exclusiva y libre de fraudes, necesitamos validar que eres un profesional real.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 text-left">
                                <div className="mt-1"><Lock size={18} className="text-[#E5CB67]" /></div>
                                <div>
                                    <strong className="block text-white mb-1">Encriptación Total</strong>
                                    <p className="text-gray-400 text-xs leading-relaxed">Tus documentos viajan encriptados y nadie ajeno al equipo de validación tiene acceso a ellos.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 text-left">
                                <div className="mt-1"><Shield size={18} className="text-[#E5CB67]" /></div>
                                <div>
                                    <strong className="block text-white mb-1">Compromiso de Honor</strong>
                                    <p className="text-gray-400 text-xs leading-relaxed">Al activar tu cuenta, declaras que los documentos son legítimos y te pertenecen. El uso de datos falsos implicará la suspensión permanente.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowPolicyModal(false)}
                            className="w-full bg-[#E5CB67] hover:bg-[#FF9F2A] text-black font-bold py-3.5 rounded-xl transition-all active:scale-95"
                        >
                            Entendido y Cerrar
                        </button>
                    </div>
                </div>
            )}


            <div className="flex items-center justify-between w-full max-w-4xl mt-auto md:mt-0 gap-6">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-700 bg-[#121212] hover:border-[#E5CB67] hover:text-[#E5CB67] text-gray-400 flex items-center justify-center transition-all shadow-lg active:scale-90"
                    title="Volver"
                >
                    <ChevronLeft className="ml-[-2px]" size={24} />
                </button>

                <button
                    onClick={handleFinalSubmit}
                    disabled={!allUploaded || loading !== null || !isPolicyAccepted}
                    className="flex-1 md:flex-none md:w-80 bg-[#E5CB67] text-black py-3 md:py-3.5 rounded-full font-bold text-base md:text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-[#E5CB67]/10 flex justify-center items-center gap-2 active:scale-95"
                >
                    {loading === 'FINAL' ? "Enviando..." : "Enviar a Revisión"}
                </button>
            </div>
        </div>
    );
}
