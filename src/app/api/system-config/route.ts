import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const [configs, themeConfigs] = await Promise.all([
            prisma.systemConfig.findMany(),
            (prisma as any).themeConfig.findMany()
        ]);

        const system: Record<string, string> = {};
        configs.forEach((c: any) => { system[c.key] = c.value; });

        const themes: Record<string, Record<string, string>> = { light: {}, dark: {} };
        themeConfigs.forEach((c: any) => {
            if (!themes[c.theme]) themes[c.theme] = {};
            themes[c.theme][c.key] = c.value;
        });

        return NextResponse.json({ system, themes }, {
            headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }
        });
    } catch {
        return NextResponse.json({ system: {}, themes: { light: {}, dark: {} } });
    }
}