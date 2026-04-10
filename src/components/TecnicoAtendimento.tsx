//src\components\TecnicoAtendimento.tsx

"use client";
import { useState, useRef } from 'react';
import { FileText, History, Image as ImageIcon, Paperclip, X, Camera } from 'lucide-react';

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
                body: JSON.stringify({ content: note, isInternal, proofImage: base64Image })
            });
            if (res.ok) {
                setNote(""); setBase64Image(null); onUpdate();
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    // TESTE FORÇADO: Se clicar aqui e não abrir um alerta, o código novo não subiu!
    const testarBotao = () => {
        alert("O CÓDIGO NOVO ESTÁ ATIVO!");
        const foto = ticket.comments?.find((c: any) => c.proofImage)?.proofImage;
        if (foto) {
            setSelectedGalleryImage(foto);
        } else {
            alert("Botão OK, mas não há fotos no banco de dados para este ticket.");
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8 relative bg-background p-4 rounded-3xl">
            
            {/* MODAL DA GALERIA */}
            {selectedGalleryImage && (
                <div className="fixed inset-0 z-9999 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedGalleryImage(null)}>
                    <img src={selectedGalleryImage} className="max-w-full max-h-full rounded-lg" alt="Galeria" />
                    <button className="absolute top-10 right-10 text-white bg-red-600 p-4 rounded-full">FECHAR (X)</button>
                </div>
            )}

            {/* LADO ESQUERDO */}
            <div className="bg-card p-8 rounded-4xl shadow-xl border-4 border-blue-500">
                <div className="flex items-center gap-4 mb-6">
                    {/* BOTÃO DE TESTE - SE ELE NÃO ESTIVER VERMELHO, O DEPLOY FALHOU */}
                    <button 
                        onClick={testarBotao}
                        className="p-6 bg-red-600 text-white rounded-2xl animate-pulse shadow-lg"
                    >
                        <Camera size={32} />
                    </button>
                    <h2 className="font-black uppercase">Clique no Vermelho para Testar</h2>
                </div>

                <textarea 
                    className="w-full p-4 border-2 rounded-2xl h-32 mb-4" 
                    placeholder="Escreva algo..." 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                />
                
                <input type="file" ref={fileInputRef} hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setBase64Image(reader.result as string);
                        reader.readAsDataURL(file);
                    }
                }} />

                <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-slate-200 rounded-xl font-bold uppercase text-[10px]">Anexar Foto</button>
                    <button onClick={() => handleSave(false)} className="flex-1 p-4 bg-emerald-600 text-white rounded-xl font-bold uppercase">Enviar</button>
                </div>
            </div>

            {/* LADO DIREITO (HISTÓRICO) */}
            <div className="bg-card p-8 rounded-4xl shadow-xl">
                <h2 className="font-black uppercase mb-4 opacity-30">Histórico</h2>
                <div className="space-y-4">
                    {ticket.comments?.map((c: any) => (
                        <div key={c.id} className="p-4 bg-background rounded-2xl border">
                            <p className="text-sm font-bold">{c.content || "Sem texto"}</p>
                            {c.proofImage && (
                                <button 
                                    onClick={() => setSelectedGalleryImage(c.proofImage)}
                                    className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase"
                                >
                                    Ver Foto
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}