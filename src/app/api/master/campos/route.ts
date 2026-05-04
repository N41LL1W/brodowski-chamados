import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    const fields = await (prisma as any).customField.findMany({
        orderBy: { order: 'asc' }
    });
    return NextResponse.json(fields);
}

export async function PUT(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const fields = await req.json();
    await (prisma as any).customField.deleteMany({});
    if (fields.length > 0) {
        await (prisma as any).customField.createMany({
            data: fields.map((f: any, i: number) => ({
                name: f.name,
                label: f.label,
                type: f.type || 'text',
                options: f.options ? JSON.stringify(f.options) : null,
                required: f.required ?? false,
                active: f.active ?? true,
                order: i
            }))
        });
    }
    return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { id } = await req.json();
    await (prisma as any).customField.delete({ where: { id } });
    return NextResponse.json({ success: true });
}