import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    // Apenas MASTER pode criar usuários manualmente com cargos definidos
    if (!session || (session.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { name, email, password, roleId, levelId, roleName } = await req.json();

        // Verifica se o e-mail já existe
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ message: "Este e-mail já está cadastrado." }, { status: 400 });
        }

        const passwordHash = password ? await bcrypt.hash(password, 10) : null;

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: roleName || "FUNCIONARIO", // String de compatibilidade
                roleId: roleId ? parseInt(roleId) : undefined,
                levelId: levelId ? parseInt(levelId) : undefined,
            }
        });

        return NextResponse.json(newUser);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 });
    }
}