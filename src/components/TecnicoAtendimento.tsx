"use client";
import { useState, useRef, useEffect } from 'react';
import { 
    FileText, History, Image as ImageIcon, Paperclip, 
    X, AlertCircle, Camera 
} from 'lucide-react';

export default function TecnicoAtendimento({ ticket, onUpdate }: any) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // DEBUG: Monitorar se os comentários estão chegando
    useEffect(() => {
        console.log("Comentários carregados:", ticket?.comments?.length);
    }, [ticket]);

    const handleSave = async (isInternal: boolean) => {
        if (!note.trim() && !base64Image) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: note || (base64Image ? "Evidência fotográfica anexada" : ""), 
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
            alert("Erro ao conectar com o servidor");
        } finally {
            setLoading(false);
        }
    };

    // FUNÇÃO DE ATALHO COM VALIDAÇÃO FORÇADA
    const abrirGaleriaAtalho = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Busca a imagem mais recente que tenha conteúdo real
        const ultimaFoto = ticket.comments?.find((c: any) => c.proofImage && c.proofImage.length > 100)?.proofImage;
        
        if (ultimaFoto) {
            setSelectedGalleryImage(ultimaFoto);
        } else {
            // Se não tiver foto, avisamos o usuário para ele saber que o botão FUNCIONOU, mas não há dados
            alert("O botão funciona! Mas ainda não existem fotos salvas neste chamado.");
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8 relative font-sans text-slate-900">
            
            {/* MODAL DA GALERIA - Aumentei o Z-INDEX para o máximo possível (99999) */}
            {selectedGalleryImage && (
                <div 
                    className="fixed inset-0 z-99999 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden"
                    onClick={() => setSelectedGalleryImage(null)}
                >
                    <div className="relative max-w-5xl w-full flex flex-col items-center">
                        <button 
                            className="absolute -top-16 right-0 p-4 bg-white text-black rounded-full hover:bg-red-500 hover:text-white transition-all shadow-2xl z-100000"
                            onClick={() => setSelectedGalleryImage(null)}
                        >
                            <X size={32} strokeWidth={3} />
                        </button>
                        
                        <img 
                            src={selectedGalleryImage} 
                            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(255,255,255,0.1)] border border-white/20 animate-in zoom-in-95 duration-300"
                            alt="Evidência Ampliada"
                            onClick={(e) => e.stopPropagation()}
                        />
                        
                        <p className="mt-6 text-white/50 font-black uppercase tracking-widest text-[10px]">
                            Clique fora para fechar a visualização
                        </p>
                    </div>
                </div>
            )}

            {/* FORMULÁRIO ESQUERDO */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        {/* BOTÃO DA CÂMERA - CORRIGIDO COM Z-INDEX E POINTER */}
                        <button 
                            onClick={abrirGaleriaAtalho}
                            type="button"
                            className="relative z-10 p-5 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 active:scale-90 transition-all shadow-xl shadow-blue-200 flex items-center justify-center border-b-4 border-blue-800"
                        >
                            <Camera size={28} />
                        </button>
                        <div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Evidências</h2>
                            <p className="text-lg font-black uppercase text-slate-800 dark:text-white">Registrar</p>
                        </div>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 rounded-2xl transition-all flex items-center gap-3 text-[10px] font-black uppercase border-2 ${base64Image ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                    >
                        <Paperclip size={20} /> {base64Image ? "Pronto" : "Anexar"}
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
                    className="w-full p-8 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-4xl h-48 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none text-base font-medium"
                    placeholder="Descreva detalhadamente o que foi feito..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {base64Image && (
                    <div className="mt-6 flex items-center gap-5 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-4xl border border-blue-100 animate-bounce-short">
                        <img src={base64Image} className="h-20 w-20 object-cover rounded-2xl border-4 border-white shadow-xl" alt="Preview" />
                        <div className="flex-1">
                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Foto Capturada</p>
                            <p className="text-[10px] text-blue-400 font-bold">Clique em Finalizar para salvar</p>
                        </div>
                        <button onClick={() => setBase64Image(null)} className="p-3 bg-white text-red-500 rounded-full shadow-lg hover:bg-red-50"><X size={20} /></button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-5 mt-10">
                    <button onClick={() => handleSave(false)} disabled={loading} className="p-6 bg-emerald-600 text-white rounded-4xl font-black uppercase text-[12px] hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition-all active:scale-95">
                        {loading ? "Salvando..." : "Finalizar Chamado"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={loading} className="p-6 bg-slate-800 text-white rounded-4xl font-black uppercase text-[12px] hover:bg-black transition-all">
                        Nota Interna
                    </button>
                </div>
            </div>

            {/* HISTÓRICO DIREITO */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-[3rem] p-10 border-2 border-white dark:border-slate-800 flex flex-col h-[700px] shadow-inner">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl shadow-sm"><History size={28} /></div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Histórico de Atendimento</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-3 custom-scrollbar">
                    {ticket.comments?.map((c: any) => {
                        const hasImg = c.proofImage && c.proofImage.length > 100;
                        const isInt = c.content?.includes("[INTERNO]");

                        return (
                            <div key={c.id} className={`p-8 rounded-[2.5rem] border-2 transition-all ${isInt ? 'bg-amber-50/40 border-amber-100 shadow-none' : 'bg-white dark:bg-slate-900 border-transparent shadow-xl shadow-slate-200/50'}`}>
                                <div className="flex justify-between items-center mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${isInt ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{c.user?.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                                    {c.content?.replace("[INTERNO] ", "") || "Procedimento com foto"}
                                </p>

                                {hasImg ? (
                                    <button 
                                        onClick={() => setSelectedGalleryImage(c.proofImage)}
                                        className="w-full py-5 bg-blue-600 text-white text-[12px] font-black uppercase rounded-3xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <ImageIcon size={20} className="group-hover:rotate-12 transition-transform" />
                                        Visualizar Evidência
                                    </button>
                                ) : c.content?.toLowerCase().includes("foto") ? (
                                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-500">
                                        <AlertCircle size={20} />
                                        <span className="text-[10px] font-black uppercase">Imagem não encontrada no servidor</span>
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