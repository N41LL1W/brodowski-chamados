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
                    content: note || "Anexo de foto", 
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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8 relative">
            
            {/* MODAL DE GALERIA */}
            {selectedGalleryImage && (
                <div className="fixed inset-0 z-9999 bg-black/95 flex flex-col items-center justify-center p-4" onClick={() => setSelectedGalleryImage(null)}>
                    <button className="absolute top-10 right-10 text-white bg-red-600 p-4 rounded-full shadow-2xl z-50"><X size={40} /></button>
                    <img src={selectedGalleryImage} className="max-w-full max-h-[80vh] border-4 border-white rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.3)]" />
                    <div className="mt-8 flex gap-4">
                        <a href={selectedGalleryImage} download="foto.png" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase">Baixar Foto</a>
                    </div>
                </div>
            )}

            {/* FORMULÁRIO */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border-2 border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-blue-600">Atendimento</h2>
                    <button onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-2xl transition-all ${base64Image ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Paperclip size={20} />
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setBase64Image(reader.result as string);
                            reader.readAsDataURL(file);
                        }
                    }} />
                </div>

                <textarea className="w-full p-6 bg-slate-50 rounded-3xl h-32 border-2 border-slate-100 focus:border-blue-500 outline-none" placeholder="O que foi feito?" value={note} onChange={(e) => setNote(e.target.value)} />

                {base64Image && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-2xl flex items-center gap-4 border-2 border-emerald-200">
                        <img src={base64Image} className="h-14 w-14 rounded-lg object-cover shadow-md" />
                        <span className="text-xs font-bold text-emerald-700">FOTO PRONTA PARA ENVIAR!</span>
                        <button onClick={() => setBase64Image(null)} className="ml-auto text-red-500"><X size={20} /></button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <button onClick={() => handleSave(false)} className="p-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase">Enviar Cliente</button>
                    <button onClick={() => handleSave(true)} className="p-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase">Nota Interna</button>
                </div>
            </div>

            {/* CHAT / HISTÓRICO (Onde a Galeria aparece) */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-inner border-2 border-slate-200 h-[600px] flex flex-col">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-6">Histórico de Mensagens</h3>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {ticket.comments?.map((c: any) => (
                        <div key={c.id} className={`p-5 rounded-3xl border-2 ${c.proofImage ? 'border-blue-400 bg-blue-50/50' : 'border-white bg-white shadow-sm'}`}>
                            <div className="flex justify-between text-[9px] font-bold opacity-40 mb-2">
                                <span>{c.user?.name}</span>
                                <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm font-medium mb-4">{c.content}</p>

                            {/* TESTE VISUAL DE IMPACTO */}
                            {c.proofImage ? (
                                <button 
                                    onClick={() => setSelectedGalleryImage(c.proofImage)}
                                    className="w-full py-4 bg-yellow-400 text-black font-black uppercase text-[12px] rounded-2xl border-b-4 border-yellow-600 hover:bg-yellow-300 transition-all flex items-center justify-center gap-3 animate-pulse"
                                >
                                    <ImageIcon size={20} />
                                    ABRIR FOTO ANEXADA
                                </button>
                            ) : (
                                <span className="text-[9px] text-slate-300 italic">Sem anexo</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}