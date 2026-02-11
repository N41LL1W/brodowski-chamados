"use client";

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, Clock, User, MapPin, Wrench, 
  CheckCircle, Loader2, Send, Undo2, PauseCircle, Camera, X, Building, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); 
    const router = useRouter();

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const loadTicket = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/tickets/${id}`);
            const data = await res.json();
            setTicket(data);
        } catch (err) { 
            console.error("Erro ao carregar:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { if (id) loadTicket(); }, [id]);

    // FUNÇÃO PARA CONVERTER IMAGEM REAL EM STRING (BASE64)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // Limite de 4MB para não travar o banco
                alert("Imagem muito grande! Escolha uma foto de até 4MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateStatus = async (action: string) => {
        const confirmMsg = action === 'DEVOLVER' ? "Devolver para a fila geral?" : "Confirmar alteração?";
        if (!confirm(confirmMsg)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                // Enviamos a string Base64 da imagem real aqui
                body: JSON.stringify({ 
                    action, 
                    proofImage: action === 'FINALIZAR' ? imagePreview : null 
                })
            });
            
            if (res.ok) {
                if (['DEVOLVER', 'FINALIZAR'].includes(action)) {
                    router.push('/tecnico');
                    router.refresh();
                } else {
                    loadTicket();
                }
            } else {
                const errorData = await res.json();
                alert(`Erro: ${errorData.message || "Falha na operação"}`);
            }
        } catch (err) { 
            alert("Erro de conexão com o servidor"); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    if (!ticket) return <div className="p-20 text-center font-bold text-slate-500 uppercase tracking-widest">Chamado não encontrado.</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            <header className="flex justify-between items-center">
                <Link href="/tecnico" className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> Voltar ao Painel
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{ticket.protocol}</span>
                    <Badge variant="status" value={ticket.status}>{ticket.status}</Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 shadow-xl border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-[2.5rem]">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6 leading-tight">
                            {ticket.subject}
                        </h1>
                        
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl mb-8 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {ticket.description}
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            <button 
                                onClick={() => handleUpdateStatus('PAUSAR')} 
                                className="flex-1 bg-amber-100 text-amber-700 p-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-amber-200 transition-all active:scale-95 border border-amber-200"
                            >
                                <PauseCircle size={18}/> Pausar
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus('DEVOLVER')} 
                                className="flex-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 p-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
                            >
                                <Undo2 size={18}/> Devolver para Fila
                            </button>
                        </div>

                        {/* Diário de Atividades */}
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Diário de Atividades</h4>
                            <textarea 
                                value={nota} 
                                onChange={(e) => setNota(e.target.value)} 
                                placeholder="Descreva o andamento técnico..." 
                                className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-none rounded-3xl min-h-[140px] focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" 
                            />
                            <button 
                                onClick={async () => {
                                    if(!nota.trim()) return;
                                    setIsSubmitting(true);
                                    const res = await fetch(`/api/tickets/${id}`, { 
                                        method: 'POST', 
                                        headers: {'Content-Type': 'application/json'}, 
                                        body: JSON.stringify({ content: nota }) 
                                    });
                                    if(res.ok) { setNota(""); loadTicket(); }
                                    setIsSubmitting(false);
                                }} 
                                disabled={isSubmitting || !nota.trim()} 
                                className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                <Send size={16} className="inline mr-2"/> Registrar Atualização
                            </button>
                        </div>
                    </Card>

                    {/* ÁREA DE FINALIZAÇÃO COM UPLOAD REAL */}
                    <Card className="p-8 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] shadow-2xl shadow-emerald-200/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/30">
                                <CheckCircle size={20}/>
                            </div>
                            <div>
                                <h3 className="font-black text-emerald-800 dark:text-emerald-400 uppercase text-xs tracking-tight leading-none">Conclusão de Chamado</h3>
                                <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Obrigatório anexo de foto</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className={`relative border-2 border-dashed rounded-4x1 p-8 text-center transition-all ${
                                imagePreview ? 'border-emerald-500 bg-white dark:bg-slate-900' : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50'
                            }`}>
                                {!imagePreview ? (
                                    <label className="cursor-pointer group block">
                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Camera className="text-emerald-600" size={32} />
                                        </div>
                                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-tighter">Tirar ou Selecionar Foto</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">PNG, JPG até 4MB</p>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            capture="environment" // Abre a câmera direto no celular
                                            onChange={handleImageChange} 
                                        />
                                    </label>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                            <button 
                                                onClick={() => setImagePreview(null)} 
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <X size={20}/>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                                            <ImageIcon size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Imagem pronta para envio</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => handleUpdateStatus('FINALIZAR')} 
                                disabled={!imagePreview || isSubmitting} 
                                className="w-full bg-emerald-600 text-white p-6 rounded-3xl font-black text-xl uppercase shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Finalizar Chamado"}
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Sidebar com informações */}
                <aside className="space-y-6">
                    <Card className="p-8 space-y-6 border-none ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl rounded-[2.5rem]">
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">Detalhes do Pedido</h3>
                        
                        <div className="space-y-5">
                            <InfoItem icon={<User size={18}/>} label="Solicitante" value={ticket.requester?.name} />
                            <InfoItem icon={<Building size={18}/>} label="Departamento" value={ticket.department?.name} />
                            <InfoItem icon={<MapPin size={18}/>} label="Endereço/Local" value={ticket.location} />
                            <InfoItem icon={<Clock size={18}/>} label="Abertura" value={new Date(ticket.createdAt).toLocaleString('pt-BR')} />
                            
                            <div className="pt-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nível de Urgência</p>
                                <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="mt-1 text-blue-500 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">{icon}</div>
            <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight">{value || "Não informado"}</p>
            </div>
        </div>
    );
}