"use client";
import { useState, useRef } from 'react';
import { FileText, History, Image as ImageIcon, Paperclip, X, AlertCircle } from 'lucide-react';

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
                onUpdate(); // Atualiza a lista de comentários na tela
            }
        } catch (err) {
            console.error("Erro ao salvar:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8 relative font-sans text-slate-900">
            
            {/* MODAL DA GALERIA (FULLSCREEN) */}
            {selectedGalleryImage && (
                <div 
                    className="fixed inset-0 z-[999] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedGalleryImage(null)}
                >
                    <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all">
                        <X size={28} />
                    </button>
                    <img 
                        src={selectedGalleryImage} 
                        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300"
                        alt="Visualização"
                    />
                </div>
            )}

            {/* COLUNA 1: FORMULÁRIO DE ENVIO */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">Painel de Resposta</h2>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase ${base64Image ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <Paperclip size={18} /> {base64Image ? "Foto Pronta" : "Anexar"}
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

                <textarea 
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl h-32 outline-none focus:border-blue-500 transition-all resize-none text-sm font-medium"
                    placeholder="O que foi resolvido neste atendimento?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {base64Image && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <img src={base64Image} className="h-12 w-12 object-cover rounded-lg border-2 border-white shadow-sm" alt="Preview" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Imagem preparada para envio</span>
                        <button onClick={() => setBase64Image(null)} className="ml-auto p-1 text-red-500"><X size={16} /></button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <button onClick={() => handleSave(false)} disabled={loading} className="p-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100">
                        {loading ? "Enviando..." : "Enviar Cliente"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={loading} className="p-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-amber-600 transition-all active:scale-95">
                        Nota Interna
                    </button>
                </div>
            </div>

            {/* COLUNA 2: HISTÓRICO DE MENSAGENS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-[550px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl"><History size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Linha do Tempo</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {ticket.comments?.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <History size={48} />
                            <p className="text-xs font-bold uppercase mt-2">Sem interações</p>
                        </div>
                    )}

                    {ticket.comments?.map((c: any) => {
                        // Lógica de detecção de imagem: Campo proofImage ou se o texto diz que tem foto
                        const hasImage = c.proofImage && c.proofImage.length > 50;
                        const isInternal = c.content?.startsWith("[INTERNO]");

                        return (
                            <div key={c.id} className={`p-5 rounded-[2rem] border transition-all ${isInternal ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex justify-between items-center mb-3 text-[9px] font-black uppercase tracking-tighter opacity-40">
                                    <span className="bg-slate-200 px-2 py-1 rounded-md">{c.user?.name}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                
                                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                                    {c.content?.replace("[INTERNO] ", "") || "Foto anexada ao chamado"}
                                </p>

                                {/* EXIBIÇÃO DA FOTO NA GALERIA */}
                                {hasImage ? (
                                    <button 
                                        onClick={() => setSelectedGalleryImage(c.proofImage)}
                                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                                    >
                                        <ImageIcon size={16} />
                                        Visualizar Anexo
                                    </button>
                                ) : c.content?.toLowerCase().includes("foto") ? (
                                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 text-red-500">
                                        <AlertCircle size={14} />
                                        <span className="text-[9px] font-bold uppercase text-red-400">Erro: O arquivo não subiu para o banco</span>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}