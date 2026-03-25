"use client";
import { useState, useRef } from 'react';
import { FileText, History, MessageSquare, Terminal, Image as ImageIcon, Paperclip, X } from 'lucide-react';

export default function TecnicoAtendimento({ ticket, onUpdate }: any) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Função para converter a imagem selecionada em Base64
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBase64Image(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (isInternal: boolean) => {
        // Agora permite salvar se tiver nota OU se tiver imagem
        if (!note.trim() && !base64Image) return;
        
        setLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: note, 
                    isInternal, 
                    proofImage: base64Image // ENVIANDO A FOTO REAL AQUI!
                })
            });

            if (res.ok) {
                setNote("");
                setBase64Image(null); // Limpa a foto após enviar
                onUpdate();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* ENTRADA DE DADOS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                        <h2 className="text-sm font-black uppercase tracking-widest">Painel de Ações</h2>
                    </div>
                    
                    {/* Botão para abrir seletor de arquivos */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-2xl text-slate-600 transition-all flex items-center gap-2 text-[10px] font-bold uppercase"
                    >
                        <Paperclip size={18} /> Anexar Foto
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>

                <textarea 
                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl h-32 outline-none focus:border-blue-500 transition-all resize-none font-medium"
                    placeholder="Descreva o que foi feito..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {/* Preview da imagem antes de enviar */}
                {base64Image && (
                    <div className="mt-4 relative inline-block">
                        <img src={base64Image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-blue-500" />
                        <button 
                            onClick={() => setBase64Image(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button 
                        onClick={() => handleSave(false)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 p-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                        <MessageSquare size={16} /> Enviar ao Cliente
                    </button>
                    <button 
                        onClick={() => handleSave(true)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 p-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-amber-600 transition-all disabled:opacity-50"
                    >
                        <Terminal size={16} /> Nota Interna
                    </button>
                </div>
            </div>

            {/* LINHA DO TEMPO (CHAT) */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-[500px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><History size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest">Linha do Tempo</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {ticket.comments?.map((c: any) => {
                        const isInternal = c.content?.startsWith("[INTERNO]");
                        const cleanContent = c.content?.replace("[INTERNO] ", "");
                        
                        let bgColor = "bg-blue-600 text-white"; 
                        let borderColor = "border-transparent";

                        if (isInternal) {
                            bgColor = "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400";
                            borderColor = "border-amber-200 dark:border-amber-800";
                        } else if (["TECNICO", "ADMIN", "MASTER"].includes(c.user?.role)) {
                            bgColor = "bg-emerald-600 text-white";
                        }

                        return (
                            <div key={c.id} className={`p-4 rounded-2xl border ${bgColor} ${borderColor} shadow-sm`}>
                                <div className="flex justify-between items-center mb-1 opacity-80 text-[9px] font-black uppercase">
                                    <span>{c.user?.name}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-sm font-medium">{cleanContent}</p>

                                {/* AQUI É ONDE A MÁGICA ACONTECE NO CHAT */}
                                {c.proofImage && (
                                    <div className="mt-3 relative group">
                                        <a href={c.proofImage} target="_blank" rel="noopener noreferrer">
                                            <img 
                                                src={c.proofImage} 
                                                alt="Anexo técnico" 
                                                className="rounded-xl border border-black/10 max-h-48 w-full object-cover hover:opacity-90 transition-all"
                                            />
                                            <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ImageIcon size={14} />
                                            </div>
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