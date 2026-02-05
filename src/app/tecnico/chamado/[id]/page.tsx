"use client";

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, Clock, User, MapPin, Wrench, 
  CheckCircle, AlertTriangle, Loader2, MessageSquare, Send,
  Undo2, PauseCircle, Camera, X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params); 
    const id = resolvedParams.id;
    const router = useRouter();

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const loadTicket = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/tickets/${id}`);
            const data = await res.json();
            setTicket(data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { loadTicket(); }, [id]);

    const handleUpdateStatus = async (action: string) => {
        const confirmMsg = action === 'DEVOLVER' ? "Deseja devolver este chamado para a fila geral?" : "Confirmar alteração?";
        if (!confirm(confirmMsg)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action,
                    proofImage: imagePreview // Envia a imagem se houver
                })
            });
            if (res.ok) {
                if (action === 'DEVOLVER' || action === 'FINALIZAR') router.push('/tecnico');
                else loadTicket();
            }
        } catch (err) { alert("Erro na operação"); } 
        finally { setIsSubmitting(false); }
    };

    const handleSaveNote = async () => {
        if (!nota.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: nota })
            });
            if (res.ok) { setNota(""); loadTicket(); }
        } catch (err) { alert("Erro ao salvar nota."); } 
        finally { setIsSubmitting(false); }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <Link href="/tecnico" className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase"><ArrowLeft size={16} /> Voltar</Link>
                <div className="flex gap-2">
                    <Badge variant="status" value={ticket.status}>{ticket.status}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 shadow-xl border-none ring-1 ring-slate-200">
                        <h1 className="text-3xl font-black text-slate-800 uppercase mb-6">{ticket.subject}</h1>
                        <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">{ticket.description}</div>

                        {/* BOTÕES DE AÇÃO RÁPIDA */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            <button onClick={() => handleUpdateStatus('PAUSAR')} className="flex-1 bg-amber-100 text-amber-700 p-4 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-amber-200 transition-all">
                                <PauseCircle size={18}/> Pausar (Peça)
                            </button>
                            <button onClick={() => handleUpdateStatus('DEVOLVER')} className="flex-1 bg-slate-100 text-slate-700 p-4 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                                <Undo2 size={18}/> Devolver Chamado
                            </button>
                        </div>

                        {/* DIÁRIO DE BORDO (NOTAS) */}
                        <div className="space-y-4">
                            <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="O que você fez agora?" className="w-full p-4 border rounded-2xl min-h-[100px]" />
                            <button onClick={handleSaveNote} disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest"><Send size={16} className="inline mr-2"/> Registrar Atividade</button>
                        </div>
                    </Card>

                    {/* ÁREA DE FINALIZAÇÃO COM FOTO */}
                    <Card className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem]">
                        <h3 className="font-black text-emerald-800 uppercase text-xs mb-4">Finalização do Atendimento</h3>
                        
                        <div className="space-y-4">
                            {/* Simulador de Upload */}
                            <div className="relative border-2 border-dashed border-emerald-200 rounded-2xl p-6 text-center bg-white cursor-pointer hover:bg-emerald-50 transition-all">
                                {!imagePreview ? (
                                    <label className="cursor-pointer">
                                        <Camera className="mx-auto text-emerald-400 mb-2" size={32} />
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Anexar Foto da Solução (Obrigatório)</p>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setImagePreview("/placeholder-upload.jpg")} />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-700 uppercase italic">Foto anexada!</span>
                                        <button onClick={() => setImagePreview(null)} className="text-red-500"><X size={20}/></button>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => handleUpdateStatus('FINALIZAR')} disabled={!imagePreview || isSubmitting} className="w-full bg-emerald-600 text-white p-6 rounded-2xl font-black text-xl uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                                <CheckCircle size={24} className="inline mr-2"/> Concluir e Fechar
                            </button>
                        </div>
                    </Card>
                </div>

                {/* INFO LATERAL (MANTÉM O SEU IGUAL) */}
                <aside className="space-y-6">
                    {/* ... (seu Card de InfoItem aqui) ... */}
                </aside>
            </div>
        </div>
    );
}