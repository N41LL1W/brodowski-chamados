import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const configs = await prisma.systemConfig.findMany();
        const map: Record<string, string> = {};
        configs.forEach(c => { map[c.key] = c.value; });
        return NextResponse.json(map, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
        });
    } catch {
        return NextResponse.json({});
    }
}