"use client";
import { useState, useRef } from 'react';
import { FileText, History, MessageSquare, Terminal, Image as ImageIcon, Paperclip, X } from 'lucide-react';

export default function TecnicoAtendimento({ ticket, onUpdate }: any) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [base64Image, setBase64Image] = useState<string | null>(null);
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
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* PAINEL DE AÇÕES */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                        <h2 className="text-sm font-black uppercase tracking-widest">Ações do Técnico</h2>
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase ${base64Image ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                    >
                        <Paperclip size={18} /> {base64Image ? "Foto Pronta" : "Anexar Foto"}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>

                <textarea 
                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl h-32 outline-none focus:border-blue-500 transition-all resize-none font-medium"
                    placeholder="O que foi resolvido?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {base64Image && (
                    <div className="mt-4 relative inline-block">
                        <img src={base64Image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-blue-500" />
                        <button onClick={() => setBase64Image(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => handleSave(false)} disabled={loading} className="p-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-emerald-700 disabled:opacity-50">
                        {loading ? "Enviando..." : "Enviar Cliente"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={loading} className="p-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-amber-600 disabled:opacity-50">
                        {loading ? "Salvando..." : "Nota Interna"}
                    </button>
                </div>
            </div>

            {/* HISTÓRICO - CHAT */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-[500px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><History size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest">Linha do Tempo</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {ticket.comments?.map((c: any) => {
                        const isInternal = c.content?.startsWith("[INTERNO]");
                        const cleanContent = c.content?.replace("[INTERNO] ", "");
                        
                        // DEBUG: Caso ainda não apareça, o console vai nos avisar
                        if (c.proofImage) console.log("Comentário com imagem detectado:", c.id);

                        return (
                            <div key={c.id} className={`p-4 rounded-2xl border ${isInternal ? 'bg-amber-50/50 border-amber-100 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                                <div className="flex justify-between items-center mb-2 text-[9px] font-black uppercase opacity-60">
                                    <span>{c.user?.name}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm mb-2 font-medium leading-relaxed">{cleanContent}</p>

                                {/* RENDERIZAÇÃO DA IMAGEM */}
                                {c.proofImage && c.proofImage.length > 10 && (
                                    <div className="mt-3">
                                        <a href={c.proofImage} target="_blank" rel="noopener noreferrer">
                                            <img 
                                                src={c.proofImage} 
                                                alt="Anexo" 
                                                className="rounded-xl max-h-52 w-full object-cover border border-black/5 hover:scale-[1.01] transition-transform"
                                                loading="lazy"
                                            />
                                        </a>
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