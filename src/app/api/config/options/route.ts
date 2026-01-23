import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Busca Categorias e Departamentos (para o Formulário) + Roles e Levels (para o Admin)
export async function GET() {
    try {
        const [categories, departments, roles, levels] = await Promise.all([
            prisma.category.findMany({ orderBy: { name: 'asc' } }),
            prisma.department.findMany({ orderBy: { name: 'asc' } }),
            prisma.role.findMany({ orderBy: { name: 'asc' } }),
            prisma.level.findMany({ orderBy: { rank: 'asc' } })
        ]);
        
        return NextResponse.json({ 
            categories, 
            departments, 
            roles, 
            levels 
        });
    } catch (error) {
        console.error("Erro ao buscar opções:", error);
        return NextResponse.json({ 
            categories: [], 
            departments: [], 
            roles: [], 
            levels: [] 
        }, { status: 500 });
    }
}

// POST: Cria novos registros (Role, Level, Category ou Department)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // Verificação de permissão MASTER
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { type, name, rank, icon, id } = await req.json();

        // Usamos (prisma as any) para evitar erros de tipagem no build da Vercel
        // já que removemos o @default(cuid()) do schema.
        switch (type) {
            case 'category':
                return NextResponse.json(await (prisma as any).category.create({ 
                    data: { 
                        id: id || `cat_${Date.now()}`, // Gera ID manual se não vier no body
                        name, 
                        icon: icon || 'Monitor' 
                    } 
                }));
            case 'department':
                return NextResponse.json(await (prisma as any).department.create({ 
                    data: { 
                        id: id || `dept_${Date.now()}`, // Gera ID manual se não vier no body
                        name 
                    } 
                }));
            case 'role':
                return NextResponse.json(await prisma.role.create({ 
                    data: { name } 
                }));
            case 'level':
                return NextResponse.json(await prisma.level.create({ 
                    data: { name, rank: parseInt(rank) || 1 } 
                }));
            default:
                return new NextResponse('Tipo inválido', { status: 400 });
        }
    } catch (error: any) {
        console.error("Erro ao criar:", error);
        return NextResponse.json({ 
            message: "Erro ao criar opção", 
            details: error.message 
        }, { status: 500 });
    }
}

// DELETE: Remove as opções (apenas se não houver vínculos)
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id'); 
        const type = searchParams.get('type');

        if (!id || !type) return NextResponse.json({ message: "Dados insuficientes" }, { status: 400 });

        if (type === 'category') {
            const count = await prisma.ticket.count({ where: { categoryId: id } });
            if (count > 0) return NextResponse.json({ message: "Categoria em uso em chamados" }, { status: 400 });
            await (prisma as any).category.delete({ where: { id: id } });
        } 
        else if (type === 'department') {
            const count = await prisma.ticket.count({ where: { departmentId: id } });
            if (count > 0) return NextResponse.json({ message: "Departamento em uso em chamados" }, { status: 400 });
            await (prisma as any).department.delete({ where: { id: id } });
        }
        else if (type === 'role') {
            await prisma.role.delete({ where: { id: parseInt(id) } });
        }
        else if (type === 'level') {
            await prisma.level.delete({ where: { id: parseInt(id) } });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Erro ao deletar:", error);
        return NextResponse.json({ message: "Erro ao excluir: Verifique se existem usuários ou chamados vinculados." }, { status: 500 });
    }
}