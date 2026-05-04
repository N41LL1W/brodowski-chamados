import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

const DEFAULT_MESSAGES = [
    { trigger: 'TICKET_OPENED',   label: 'Chamado aberto',          content: 'Seu chamado foi registrado e será atendido em breve. Protocolo: {protocol}' },
    { trigger: 'TICKET_ASSIGNED', label: 'Técnico atribuído',       content: 'Seu chamado foi atribuído ao técnico {tecnico}. Em breve entraremos em contato.' },
    { trigger: 'TICKET_PAUSED',   label: 'Chamado pausado',         content: 'Seu chamado foi pausado. Motivo: {motivo}' },
    { trigger: 'TICKET_CLOSED',   label: 'Chamado concluído',       content: 'Seu chamado #{protocol} foi concluído. Obrigado por utilizar nossos serviços!' },
    { trigger: 'VISIT_SCHEDULED', label: 'Visita agendada',         content: 'Uma visita técnica foi agendada para {data} às {hora}. {observacao}' },
];

export async function GET() {
    const saved = await (prisma as any).autoMessage.findMany();
    const savedMap: Record<string, any> = {};
    saved.forEach((s: any) => { savedMap[s.trigger] = s; });

    const result = DEFAULT_MESSAGES.map(m => ({
        ...m,
        content: savedMap[m.trigger]?.content ?? m.content,
        active: savedMap[m.trigger]?.active ?? true,
    }));

    return NextResponse.json(result);
}

export async function POST(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { trigger, content, active, label } = await req.json();
    const result = await (prisma as any).autoMessage.upsert({
        where: { trigger },
        update: { content, active, label },
        create: { trigger, content, active, label }
    });
    return NextResponse.json(result);
}