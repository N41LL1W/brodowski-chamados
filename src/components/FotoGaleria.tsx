//src\components\FotoGaleria.tsx

"use client";
import { useState } from 'react';
import { ImageIcon, X, Maximize2, Download, ExternalLink } from 'lucide-react';

interface FotoGaleriaProps {
    images: string[]; // Array de strings (Base64 ou URLs)
    titulo?: string;
}

export default function FotoGaleria({ images, titulo = "Galeria de Evidências" }: FotoGaleriaProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!images || images.length === 0) return null;

    return (
        <div className="w-full mt-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4 opacity-70">
                <ImageIcon size={18} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">{titulo} ({images.length})</h3>
            </div>

            {/* GRADE DE MINIATURAS */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, index) => (
                    <div 
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 cursor-pointer group hover:border-blue-500 transition-all shadow-sm"
                    >
                        <img 
                            src={img} 
                            alt={`Evidência ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Maximize2 size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL / POPUP DE VISUALIZAÇÃO */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* BOTÕES DE AÇÃO DO MODAL */}
                    <div className="absolute top-6 right-6 flex items-center gap-4">
                        <a 
                            href={selectedImage} 
                            download={`evidencia-${Date.now()}.jpg`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                            title="Baixar Imagem"
                        >
                            <Download size={24} />
                        </a>
                        <button 
                            className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all shadow-xl"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={28} />
                        </button>
                    </div>

                    {/* IMAGEM AMPLIADA */}
                    <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={selectedImage} 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                            alt="Visualização ampliada"
                        />
                    </div>
                    
                    <p className="mt-4 text-white/40 text-[10px] font-medium uppercase tracking-widest">
                        Clique fora para fechar
                    </p>
                </div>
            )}
        </div>
    );
}