"use client";

import { useState } from "react";
import { uploadDocument, submitForReview } from "../actions";
import { FileText, CreditCard, Store, Camera, Upload, Check, ChevronLeft } from "lucide-react";
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
                    <div key={doc.key} className="bg-[#121212] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between gap-4 group hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-[#FF8A00]/5 h-full">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-900 rounded-xl text-white group-hover:text-[#FF8A00] transition-colors shrink-0">
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
                        <div className="mt-2">
                            {!uploadedDocs[doc.key] ? (
                                <div className="flex gap-3">
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
                                            className="flex-1 bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 text-[#FF8A00] text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-[#FF8A00]/20 active:scale-95"
                                        >
                                            <Camera size={16} />
                                            Cámara
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button className="w-full py-2.5 text-xs text-gray-500 hover:text-white transition-colors border-t border-gray-800/50 mt-2 flex items-center justify-center gap-1 group/edit">
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

            <div className="flex items-center justify-between w-full max-w-4xl mt-auto md:mt-0 gap-6">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-700 bg-[#121212] hover:border-[#FF8A00] hover:text-[#FF8A00] text-gray-400 flex items-center justify-center transition-all shadow-lg active:scale-90"
                    title="Volver"
                >
                    <ChevronLeft className="ml-[-2px]" size={24} />
                </button>

                <button
                    onClick={handleFinalSubmit}
                    disabled={!allUploaded || loading !== null}
                    className="flex-1 md:flex-none md:w-80 bg-[#FF8A00] text-black py-3 md:py-3.5 rounded-full font-bold text-base md:text-lg hover:bg-[#FF9F2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF8A00]/10 flex justify-center items-center gap-2 active:scale-95"
                >
                    {loading === 'FINAL' ? "Enviando..." : "Enviar a Revisión"}
                </button>
            </div>
        </div>
    );
}
