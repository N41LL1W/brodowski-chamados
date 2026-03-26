"use client";
import { useState, useRef } from 'react';
import { FileText, History, Image as ImageIcon, Paperclip, X, ExternalLink, Maximize2, Download } from 'lucide-react';

export default function TecnicoAtendimento({ ticket, onUpdate }: any) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null); // Estado para o Modal
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setBase64Image(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (isInternal: boolean) => {
        if (!note.trim() && !base64Image) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: note || "Foto anexada ao atendimento", 
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
        <div className="grid lg:grid-cols-2 gap-8 mt-8 relative">
            
            {/* --- MODAL DA GALERIA (APARECE SOBRE TUDO) --- */}
            {selectedGalleryImage && (
                <div 
                    className="fixed inset-0 z-9999 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedGalleryImage(null)}
                >
                    <div className="absolute top-6 right-6 flex gap-4" onClick={e => e.stopPropagation()}>
                        <a 
                            href={selectedGalleryImage} 
                            download="evidencia.png"
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                        >
                            <Download size={24} />
                        </a>
                        <button 
                            onClick={() => setSelectedGalleryImage(null)}
                            className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    <img 
                        src={selectedGalleryImage} 
                        alt="Evidência" 
                        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10 animate-in zoom-in duration-300"
                        onClick={e => e.stopPropagation()}
                    />
                    
                    <p className="absolute bottom-10 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        Clique fora para fechar visualização
                    </p>
                </div>
            )}

            {/* PAINEL DE AÇÕES */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 font-sans">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                        <h2 className="text-sm font-black uppercase tracking-widest">Painel do Técnico</h2>
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase ${base64Image ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                    >
                        <Paperclip size={18} /> {base64Image ? "Foto Carregada" : "Anexar Foto"}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>

                <textarea 
                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl h-32 outline-none focus:border-blue-500 transition-all resize-none font-medium"
                    placeholder="Descreva a solução..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {base64Image && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl cursor-pointer group" onClick={() => setSelectedGalleryImage(base64Image)}>
                        <div className="relative">
                            <img src={base64Image} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-blue-200" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                                <Maximize2 size={14} className="text-white" />
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Ver miniatura</span>
                        <button onClick={(e) => { e.stopPropagation(); setBase64Image(null); }} className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-full"><X size={16} /></button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => handleSave(false)} disabled={loading} className="p-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all">
                        {loading ? "Processando..." : "Enviar Cliente"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={loading} className="p-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-amber-600 shadow-lg shadow-amber-200 dark:shadow-none transition-all">
                        Nota Interna
                    </button>
                </div>
            </div>

            {/* LINHA DO TEMPO (CHAT) */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-[550px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><History size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Linha do Tempo</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {ticket.comments?.map((c: any) => {
                        const isInternal = c.content?.startsWith("[INTERNO]");
                        const cleanContent = c.content?.replace("[INTERNO] ", "");
                        
                        return (
                            <div key={c.id} className={`p-5 rounded-3xl border transition-all ${isInternal ? 'bg-amber-50/40 border-amber-100 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                                <div className="flex justify-between items-center mb-3 text-[9px] font-black uppercase opacity-50 tracking-tighter">
                                    <span>{c.user?.name}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                
                                <p className="text-sm font-medium mb-4 leading-relaxed">{cleanContent}</p>

                                {/* BOTÃO QUE ABRE A GALERIA NO MODAL */}
                                {c.proofImage && (
                                    <div className="pt-3 border-t border-black/5">
                                        <button 
                                            onClick={() => setSelectedGalleryImage(c.proofImage)}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-2xl hover:bg-blue-50 transition-all shadow-sm group"
                                        >
                                            <ImageIcon size={14} className="group-hover:scale-110 transition-transform" />
                                            Visualizar Anexo
                                            <Maximize2 size={12} className="opacity-40" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}