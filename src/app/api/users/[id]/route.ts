import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * PATCH: Atualiza Cargo (Role), Nível (Level) ou a String Role de compatibilidade.
 */
export async function PATCH(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> } 
) {
    const session = await getServerSession(authOptions);
    const myRole = (session?.user as any)?.role;

    // Trava de segurança: Apenas usuários com a string MASTER no banco podem gerenciar outros
    if (!session || myRole !== 'MASTER') {
        return new NextResponse('Acesso restrito: Requer privilégios MASTER', { status: 403 });
    }

    try {
        const { id } = await params; 
        const body = await request.json();
        const { roleId, levelId, roleName } = body;

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { 
                // Atualiza a relação com a tabela Role (ID numérico)
                roleId: roleId ? parseInt(roleId) : undefined,
                
                // Atualiza a relação com a tabela Level (ID numérico)
                levelId: levelId ? parseInt(levelId) : undefined,
                
                // Atualiza a coluna de texto 'role' para manter compatibilidade com o NextAuth
                // Só atualiza se roleName for enviado, caso contrário mantém o atual
                ...(roleName && { role: roleName })
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return NextResponse.json({ message: "Erro ao atualizar banco de dados" }, { status: 500 });
    }
}

/**
 * DELETE: Remove um usuário do sistema (exceto o próprio usuário logado).
 */
export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const myRole = (session?.user as any)?.role;

    if (!session || myRole !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { id } = await params;

        // Impede que o usuário MASTER delete a si próprio e perca acesso ao painel
        if (id === (session.user as any).id) {
            return NextResponse.json({ message: "Segurança: Você não pode excluir sua própria conta." }, { status: 400 });
        }

        await prisma.user.delete({ where: { id: id } });
        
        return new NextResponse('Usuário removido com sucesso', { status: 200 });
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        return NextResponse.json({ message: "Erro ao excluir: verifique se o usuário possui chamados vinculados." }, { status: 500 });
    }
}