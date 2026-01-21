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
        
        // Retornamos tudo em um único objeto para a página de Novo Chamado e Admin usarem
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
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { type, name, rank, icon } = await req.json();

        switch (type) {
            case 'category':
                return NextResponse.json(await prisma.category.create({ 
                    data: { name, icon: icon || 'Monitor' } 
                }));
            case 'department':
                return NextResponse.json(await prisma.department.create({ 
                    data: { name } 
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
    } catch (error) {
        console.error("Erro ao criar:", error);
        return NextResponse.json({ message: "Erro ao criar opção" }, { status: 500 });
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
        const id = searchParams.get('id'); // String (CUID) para Category/Dept
        const type = searchParams.get('type');

        if (!id || !type) return NextResponse.json({ message: "Dados insuficientes" }, { status: 400 });

        // Categorias e Departamentos usam ID String. Roles e Levels usam ID numérico (ajuste conforme seu schema)
        const whereClause = (type === 'role' || type === 'level') ? { id: parseInt(id) } : { id: id };

        if (type === 'category') {
            const count = await prisma.ticket.count({ where: { categoryId: id } });
            if (count > 0) return NextResponse.json({ message: "Categoria em uso" }, { status: 400 });
            await prisma.category.delete({ where: { id: id } });
        } 
        else if (type === 'department') {
            const count = await prisma.ticket.count({ where: { departmentId: id } });
            if (count > 0) return NextResponse.json({ message: "Departamento em uso" }, { status: 400 });
            await prisma.department.delete({ where: { id: id } });
        }
        else if (type === 'role') {
            await prisma.role.delete({ where: { id: parseInt(id) } });
        }
        else if (type === 'level') {
            await prisma.level.delete({ where: { id: parseInt(id) } });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ message: "Erro ao excluir" }, { status: 500 });
    }
}