"use client";
import { useState, useRef } from 'react';
import { 
    FileText, 
    History, 
    Image as ImageIcon, 
    Paperclip, 
    X, 
    AlertCircle, 
    Camera 
} from 'lucide-react';

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
                    content: note || (base64Image ? "Evidência fotográfica anexada" : ""), 
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

    // Função para abrir a galeria no modo de teste ou imagem mais recente
    const abrirGaleriaAtalho = () => {
        const ultimaFoto = ticket.comments?.find((c: any) => c.proofImage && c.proofImage.length > 50)?.proofImage;
        setSelectedGalleryImage(ultimaFoto || "https://via.placeholder.com/800x600?text=Nenhuma+Foto+Encontrada");
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8 relative font-sans text-slate-900">
            
            {/* MODAL DA GALERIA (Z-INDEX MÁXIMO) */}
            {selectedGalleryImage && (
                <div 
                    className="fixed inset-0 z-9999 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedGalleryImage(null)}
                >
                    <button className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all">
                        <X size={32} />
                    </button>
                    <img 
                        src={selectedGalleryImage} 
                        className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10 animate-in zoom-in duration-300"
                        alt="Visualização da Evidência"
                    />
                </div>
            )}

            {/* COLUNA 1: REGISTRAR EVIDÊNCIA */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {/* ÍCONE DE CÂMERA / LINK GALERIA */}
                        <button 
                            onClick={abrirGaleriaAtalho}
                            className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:rotate-6 transition-all shadow-lg shadow-blue-200"
                            title="Abrir Galeria"
                        >
                            <Camera size={24} />
                        </button>
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Atendimento</h2>
                            <p className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Registrar Evidência</p>
                        </div>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase ${base64Image ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'}`}
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
                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl h-40 outline-none focus:border-blue-500 transition-all resize-none text-sm font-medium dark:text-slate-200"
                    placeholder="Descreva o procedimento realizado..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {base64Image && (
                    <div className="mt-4 flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 animate-in slide-in-from-bottom-2">
                        <img src={base64Image} className="h-16 w-16 object-cover rounded-xl border-2 border-white shadow-sm" alt="Preview" />
                        <div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Imagem preparada</p>
                            <p className="text-[9px] text-blue-400 uppercase">Será enviada ao clicar em finalizar</p>
                        </div>
                        <button onClick={() => setBase64Image(null)} className="ml-auto p-2 text-red-500 hover:bg-white rounded-full transition-colors"><X size={18} /></button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button onClick={() => handleSave(false)} disabled={loading} className="p-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[11px] hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100">
                        {loading ? "Enviando..." : "Finalizar Cliente"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={loading} className="p-5 bg-slate-800 text-white rounded-3xl font-black uppercase text-[11px] hover:bg-slate-900 transition-all active:scale-95">
                        Nota de Controle
                    </button>
                </div>
            </div>

            {/* COLUNA 2: HISTÓRICO DE MENSAGENS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-[650px]">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl shadow-inner"><History size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Linha do Tempo</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {ticket.comments?.map((c: any) => {
                        const hasImage = c.proofImage && c.proofImage.length > 50;
                        const isInternal = c.content?.startsWith("[INTERNO]");

                        return (
                            <div key={c.id} className={`p-6 rounded-4xl border transition-all ${isInternal ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                                <div className="flex justify-between items-center mb-4 text-[9px] font-black uppercase tracking-tighter opacity-40">
                                    <span className="bg-slate-200 px-2 py-1 rounded-md text-slate-700">{c.user?.name}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {c.content?.replace("[INTERNO] ", "") || "Foto anexada"}
                                </p>

                                {hasImage ? (
                                    <button 
                                        onClick={() => setSelectedGalleryImage(c.proofImage)}
                                        className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                                    >
                                        <ImageIcon size={18} />
                                        Visualizar Evidência
                                    </button>
                                ) : c.content?.toLowerCase().includes("foto") ? (
                                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 text-red-500">
                                        <AlertCircle size={14} />
                                        <span className="text-[9px] font-bold uppercase text-red-400">Arquivo corrompido ou ausente</span>
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