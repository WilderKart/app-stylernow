"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, X, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
    label?: string; // e.g. "Foto Frontal Cédula"
    instruction?: string; // e.g. "Centra tu documento en el recuadro"
}

export default function CameraCapture({ onCapture, onClose, label, instruction }: CameraCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check permissions on mount
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => setHasPermission(true))
            .catch((err) => {
                console.error("Camera permission denied:", err);
                setHasPermission(false);
                setError("Necesitamos acceso a tu cámara para validar tu identidad. Por favor, habilítalo en la configuración de tu navegador.");
            });
    }, []);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const handleConfirm = () => {
        if (!imgSrc) return;

        // Convert Base64 to File
        fetch(imgSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
                onCapture(file);
            });
    };

    const retake = () => {
        setImgSrc(null);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-fade-in">
            {/* Header */}
            <div className="absolute top-4 right-4 z-10">
                <button onClick={onClose} className="p-2 bg-gray-800/50 rounded-full text-white hover:bg-gray-700">
                    <X size={24} />
                </button>
            </div>

            <div className="text-center mb-4 z-10">
                <h3 className="text-xl font-bold text-white mb-1">{label || "Tomar Foto"}</h3>
                <p className="text-gray-400 text-sm">{instruction || "Asegúrate de tener buena iluminación"}</p>
            </div>

            {/* Error State */}
            {hasPermission === false && (
                <div className="flex flex-col items-center justify-center h-64 w-full max-w-sm bg-[#121212] rounded-2xl border border-red-900 p-6 text-center">
                    <AlertTriangle size={48} className="text-red-500 mb-4" />
                    <p className="text-white font-medium mb-2">Acceso Denegado</p>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-800 rounded-full text-white hover:bg-gray-700"
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {/* Camera / Preview Area */}
            {hasPermission === true && (
                <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                    {!imgSrc ? (
                        <>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "environment" }}
                                className="w-full h-full object-cover"
                            />
                            {/* Focus Frame Overlay (ID Card Shape) */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-[85%] aspect-[1.586] border-2 border-white/30 rounded-xl relative">
                                    <div className="absolute top-[-2px] left-[-2px] w-4 h-4 border-t-2 border-l-2 border-[#E5CB67]"></div>
                                    <div className="absolute top-[-2px] right-[-2px] w-4 h-4 border-t-2 border-r-2 border-[#E5CB67]"></div>
                                    <div className="absolute bottom-[-2px] left-[-2px] w-4 h-4 border-b-2 border-l-2 border-[#E5CB67]"></div>
                                    <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 border-b-2 border-r-2 border-[#E5CB67]"></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="relative w-full h-full">
                            <img src={imgSrc} alt="Capture" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center flex-col gap-2">
                                <CheckCircle size={48} className="text-[#E5CB67]" />
                                <span className="text-white font-bold">¡Foto Capturada!</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Controls */}
            {hasPermission === true && (
                <div className="mt-8 flex gap-6 z-10">
                    {!imgSrc ? (
                        <button
                            onClick={capture}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border-4 border-[#E5CB67]/20"
                        >
                            <div className="w-16 h-16 bg-[#E5CB67] rounded-full border-2 border-white"></div>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={retake}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-full text-white font-medium hover:bg-gray-700"
                            >
                                <RefreshCw size={18} />
                                Retomar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex items-center gap-2 px-6 py-3 bg-[#E5CB67] rounded-full text-black font-bold hover:bg-[#FF9F2A]"
                            >
                                <CheckCircle size={18} />
                                Confirmar
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
