import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Wrench, CheckCircle2, ArrowLeft, Calendar, Tag, MapPin } from "lucide-react";

interface Props { 
  params: Promise<{ id: string }> 
}

export default async function TicketDetailPage({ params }: Props) {
    const { id } = await params;
    
    // Busca o ticket usando o ID como String (CUID) e inclui as novas relações
    const ticket = await prisma.ticket.findUnique({ 
        where: { id: id },
        include: { 
            requester: true, 
            category: true, 
            department: true 
        } 
    });
    
    if (!ticket) return notFound();

    // Mapeamento de Status para a Barra de Progresso
    // Os nomes devem ser idênticos ao que é salvo no Banco de Dados
    const statusSteps = ['ABERTO', 'ATENDIMENTO', 'CONCLUIDO'];
    const currentStep = statusSteps.indexOf(ticket.status);

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            {/* Botão Voltar */}
            <Link href="/meus-chamados" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition-colors">
                <ArrowLeft size={20} /> Voltar para meus pedidos
            </Link>

            <div className="bg-white rounded-4xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                
                {/* Cabeçalho de Identificação */}
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                    <div>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Protocolo de Atendimento</p>
                        <h1 className="text-2xl font-mono font-bold tracking-tighter">{ticket.protocol}</h1>
                    </div>
                    <div className="text-right">
                        <span className="bg-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-900/20">
                            {ticket.status}
                        </span>
                    </div>
                </div>

                {/* Barra de Progresso Visual */}
                <div className="p-10 bg-slate-50/50 border-b border-slate-100 relative">
                    {/* Linha de fundo (Track) corrigida para z-0 */}
                    <div className="absolute top-1/2 left-16 right-16 h-1 bg-slate-200 z-0"></div>
                    
                    <div className="flex justify-between relative z-10">
                        {statusSteps.map((step, idx) => {
                            const isActive = idx <= currentStep;
                            return (
                                <div key={step} className="flex flex-col items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                        isActive 
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' 
                                        : 'bg-white border-2 border-slate-200 text-slate-300'
                                    }`}>
                                        {idx === 0 && <Clock size={24} />}
                                        {idx === 1 && <Wrench size={24} />}
                                        {idx === 2 && <CheckCircle2 size={24} />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${
                                        isActive ? 'text-blue-600' : 'text-slate-400'
                                    }`}>
                                        {step === 'ATENDIMENTO' ? 'EM CURSO' : step}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Informações Detalhadas */}
                <div className="p-8 grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Descrição do Problema</h2>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">{ticket.subject}</h3>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-600 leading-relaxed italic">
                                "{ticket.description}"
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dados do Rastreamento</h2>
                        
                        {/* Categoria */}
                        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Tag size={20}/></div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Categoria</p>
                                <p className="text-sm font-bold text-slate-700">{ticket.category?.name || "Não definida"}</p>
                            </div>
                        </div>

                        {/* Departamento */}
                        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><MapPin size={20}/></div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Localização / Setor</p>
                                <p className="text-sm font-bold text-slate-700">{ticket.department?.name || "Não definido"}</p>
                            </div>
                        </div>

                        {/* Data */}
                        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Calendar size={20}/></div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Aberto em</p>
                                <p className="text-sm font-bold text-slate-700">
                                    {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="bg-slate-50/80 p-6 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 font-medium">
                        Solicitado por: <span className="font-bold">{ticket.requester?.name || "Usuário"}</span>
                    </p>
                    <div className="flex gap-3">
                        <Link 
                            href={`/meus-chamados/${ticket.id}/edit`} 
                            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all text-xs"
                        >
                            Editar Detalhes
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}