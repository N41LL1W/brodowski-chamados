import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    const configs = await (prisma as any).themeConfig.findMany();
    const result: Record<string, Record<string, string>> = { light: {}, dark: {} };
    configs.forEach((c: any) => {
        if (!result[c.theme]) result[c.theme] = {};
        result[c.theme][c.key] = c.value;
    });
    return NextResponse.json(result);
}

export async function POST(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { theme, key, value } = await req.json();
    const result = await (prisma as any).themeConfig.upsert({
        where: { theme_key: { theme, key } },
        update: { value },
        create: { theme, key, value }
    });
    return NextResponse.json(result);
}

export async function PUT(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { theme, vars } = await req.json();
    await Promise.all(
        Object.entries(vars).map(([key, value]) =>
            (prisma as any).themeConfig.upsert({
                where: { theme_key: { theme, key } },
                update: { value },
                create: { theme, key, value: value as string }
            })
        )
    );
    return NextResponse.json({ success: true });
}