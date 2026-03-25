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
            reader.onloadstart = () => setLoading(true);
            reader.onloadend = () => {
                setBase64Image(reader.result as string);
                setLoading(false);
                console.log("📸 Foto carregada com sucesso no estado.");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (isInternal: boolean) => {
        if (!note.trim() && !base64Image) return;
        
        setLoading(true);
        console.log("🚀 Enviando para API...", { hasImage: !!base64Image, isInternal });

        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: note, 
                    isInternal, 
                    proofImage: base64Image // Verifique se este nome está IGUAL na sua rota POST
                })
            });

            if (res.ok) {
                const savedComment = await res.json();
                console.log("✅ Salvo no banco:", savedComment);
                setNote("");
                setBase64Image(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                onUpdate(); // Força o refresh dos dados
            } else {
                const errData = await res.json();
                console.error("❌ Erro na API:", errData);
            }
        } catch (err) {
            console.error("❌ Erro na requisição:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                        <h2 className="text-sm font-black uppercase tracking-widest">Painel de Ações</h2>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase ${base64Image ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                    >
                        <Paperclip size={18} /> {base64Image ? "Trocar Foto" : "Anexar Foto"}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>

                <textarea 
                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl h-32 outline-none focus:border-blue-500 transition-all resize-none font-medium"
                    placeholder="O que foi feito?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {base64Image && (
                    <div className="mt-4 flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <div className="relative">
                            <img src={base64Image} alt="Preview" className="h-16 w-16 object-cover rounded-xl shadow-md" />
                            <button onClick={() => setBase64Image(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                        </div>
                        <span className="text-xs font-bold text-blue-600 uppercase">Imagem pronta para envio</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => handleSave(false)} disabled={loading} className="p-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-emerald-700 disabled:opacity-50 transition-all">
                        Enviar Cliente
                    </button>
                    <button onClick={() => handleSave(true)} disabled={loading} className="p-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-amber-600 disabled:opacity-50 transition-all">
                        Nota Interna
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-[500px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><History size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest">Linha do Tempo</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {ticket.comments?.map((c: any) => {
                        const isInternal = c.content?.startsWith("[INTERNO]");
                        const cleanContent = c.content?.replace("[INTERNO] ", "");
                        
                        return (
                            <div key={c.id} className={`p-4 rounded-2xl border shadow-sm ${isInternal ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                <div className="flex justify-between items-center mb-2 text-[9px] font-black uppercase opacity-60">
                                    <span>{c.user?.name}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm mb-2">{cleanContent}</p>

                                {/* IMPORTANTE: Verifique se c.proofImage existe aqui */}
                                {c.proofImage && (
                                    <div className="mt-3">
                                        <a href={c.proofImage} target="_blank" rel="noopener noreferrer">
                                            <img 
                                                src={c.proofImage} 
                                                alt="Evidência" 
                                                className="rounded-xl max-h-40 w-full object-cover border border-black/5 hover:opacity-90 transition-all"
                                                onError={(e) => console.error("Erro ao carregar imagem do chat:", c.proofImage)}
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