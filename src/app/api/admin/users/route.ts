import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !['MASTER', 'CONTROLADOR'].includes((session?.user as any).role)) {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { name, email, password, role } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, passwordHash: hashedPassword, role }
        });
        return NextResponse.json(newUser);
    } catch (error) {
        return NextResponse.json({ message: "Erro ao criar" }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Não autorizado', { status: 403 });

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true }
    });
    return NextResponse.json(users);
}