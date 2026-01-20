import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Wrench, CheckCircle2, ArrowLeft } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export default async function TicketDetailPage({ params }: Props) {
    const { id } = await params;
    
    // IMPORTANTE: Buscamos pelo ID como String
    const ticket = await prisma.ticket.findUnique({ 
        where: { id: id },
        include: { 
            requester: true, // Se no seu schema estiver 'requester', mantenha assim
            category: true, 
            department: true 
        } 
    });
    
    if (!ticket) return notFound();

    // Mapeamento simples de Status para a barra de progresso
    const statusSteps = ['ABERTO', 'ATENDIMENTO', 'CONCLUIDO'];
    const currentStep = statusSteps.indexOf(ticket.status);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Link href="/meus-chamados" className="flex items-center gap-2 text-blue-600 mb-6 font-bold">
                <ArrowLeft size={20} /> Voltar
            </Link>

            <div className="bg-white shadow-xl rounded-4xl border overflow-hidden">
                <div className="bg-slate-900 p-6 text-white flex justify-between">
                    <div>
                        <p className="text-blue-400 text-[10px] font-black uppercase">Protocolo</p>
                        <h1 className="text-xl font-mono">{ticket.protocol}</h1>
                    </div>
                </div>

                {/* Barra de Progresso Simplificada */}
                <div className="p-8 bg-slate-50 flex justify-between relative">
                    {statusSteps.map((step, idx) => (
                        <div key={step} className="flex flex-col items-center z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                {idx === 0 && <Clock size={20} />}
                                {idx === 1 && <Wrench size={20} />}
                                {idx === 2 && <CheckCircle2 size={20} />}
                            </div>
                            <span className="text-[10px] font-bold mt-2">{step}</span>
                        </div>
                    ))}
                    <div className="absolute top-[52px] left-0 w-full h-1 bg-slate-200 -z-0 px-20"></div>
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-4">{ticket.subject}</h2>
                    <p className="bg-slate-50 p-4 rounded-xl text-slate-700">{ticket.description}</p>
                </div>
            </div>
        </div>
    );
}