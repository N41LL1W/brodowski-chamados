"use client";
import { useState, useRef } from 'react';
import { FileText, History, Image as ImageIcon, Paperclip, X, Maximize2, Download } from 'lucide-react';

export default function TecnicoAtendimento({ ticket, onUpdate }: any) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async (isInternal: boolean) => {
        if (!note.trim() && !base64Image) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: note, 
                    isInternal, 
                    proofImage: base64Image 
                })
            });
            if (res.ok) {
                setNote("");
                setBase64Image(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                onUpdate();
            }
        } catch (err) {
            console.error("Erro ao salvar:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8 relative font-sans text-slate-900">
            
            {/* MODAL DA GALERIA (POPUP) */}
            {selectedGalleryImage && (
                <div 
                    className="fixed inset-0 z-9999 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedGalleryImage(null)}
                >
                    <div className="absolute top-6 right-6 flex gap-4">
                        <button onClick={() => setSelectedGalleryImage(null)} className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all">
                            <X size={24} />
                        </button>
                    </div>
                    <img 
                        src={selectedGalleryImage} 
                        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10 animate-in zoom-in duration-300"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}

            {/* LADO ESQUERDO: FORMULÁRIO */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                        <h2 className="text-sm font-black uppercase tracking-widest">Atendimento Técnico</h2>
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase ${base64Image ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                    >
                        <Paperclip size={18} /> {base64Image ? "Foto Pronta" : "Anexar Foto"}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setBase64Image(reader.result as string);
                            reader.readAsDataURL(file);
                        }
                    }} accept="image/*" className="hidden" />
                </div>

                <textarea 
                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl h-32 outline-none focus:border-blue-500 transition-all resize-none font-medium text-sm"
                    placeholder="Descreva o que foi feito..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {base64Image && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100">
                        <img src={base64Image} className="h-12 w-12 object-cover rounded-lg" alt="Preview" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Imagem anexada com sucesso!</span>
                        <button onClick={() => setBase64Image(null)} className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-full"><X size={16} /></button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <button onClick={() => handleSave(false)} disabled={loading} className="p-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                        {loading ? "Enviando..." : "Enviar Cliente"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={loading} className="p-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-amber-600 transition-all">
                        Nota Interna
                    </button>
                </div>
            </div>

            {/* LADO DIREITO: CHAT COM GALERIA */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-[550px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><History size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Histórico</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {ticket.comments?.map((c: any) => (
                        <div key={c.id} className={`p-5 rounded-3xl border transition-all ${c.content?.startsWith("[INTERNO]") ? 'bg-amber-50/40 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex justify-between items-center mb-2 text-[9px] font-black uppercase opacity-40">
                                <span>{c.user?.name}</span>
                                <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                            </div>
                            
                            <p className="text-sm font-medium text-slate-700 mb-3">
                                {c.content?.replace("[INTERNO] ", "")}
                            </p>

                            {/* SE TIVER IMAGEM, MOSTRA O BOTÃO DE GALERIA */}
                            {c.proofImage && (
                                <button 
                                    onClick={() => setSelectedGalleryImage(c.proofImage)}
                                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                >
                                    <ImageIcon size={14} />
                                    Ver Foto Anexada
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}