"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface SystemConfig {
    systemName: string;
    systemSubtitle: string;
    cityName: string;
    supportPhone: string;
    supportEmail: string;
    primaryColor: string;
    logoText: string;
    registrationOpen: string;
    allowedDomain: string;
    maintenanceMode: string;
    maintenanceMessage: string;
}

const DEFAULTS: SystemConfig = {
    systemName: 'TI BRODOWSKI',
    systemSubtitle: 'Central de Operações',
    cityName: 'Brodowski',
    supportPhone: '',
    supportEmail: '',
    primaryColor: '#2563eb',
    logoText: 'TI',
    registrationOpen: 'true',
    allowedDomain: '',
    maintenanceMode: 'false',
    maintenanceMessage: 'Sistema em manutenção. Voltamos em breve.',
};

const SystemConfigContext = createContext<SystemConfig>(DEFAULTS);

export function useSystemConfig() {
    return useContext(SystemConfigContext);
}

export default function SystemConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<SystemConfig>(DEFAULTS);

    useEffect(() => {
        fetch('/api/system-config')
            .then(r => r.json())
            .then(data => {
                const merged = { ...DEFAULTS, ...data };
                setConfig(merged);

                // Aplica cor primária dinamicamente
                if (merged.primaryColor) {
                    const root = document.documentElement;
                    const hex = merged.primaryColor;

                    // Converte hex para HSL para o Tailwind
                    const r = parseInt(hex.slice(1, 3), 16) / 255;
                    const g = parseInt(hex.slice(3, 5), 16) / 255;
                    const b = parseInt(hex.slice(5, 7), 16) / 255;

                    const max = Math.max(r, g, b), min = Math.min(r, g, b);
                    let h = 0, s = 0, l = (max + min) / 2;

                    if (max !== min) {
                        const d = max - min;
                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                        switch (max) {
                            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                            case g: h = ((b - r) / d + 2) / 6; break;
                            case b: h = ((r - g) / d + 4) / 6; break;
                        }
                    }

                    const hDeg = Math.round(h * 360);
                    const sPct = Math.round(s * 100);
                    const lPct = Math.round(l * 100);

                    root.style.setProperty('--brand-color-hsl', `${hDeg} ${sPct}% ${lPct}%`);
                    root.style.setProperty('--brand-color', hex);
                }
            })
            .catch(() => {});
    }, []);

    // Modo manutenção
    if (config.maintenanceMode === 'true') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-xl mb-6">
                    {config.logoText || 'TI'}
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">
                    Sistema em Manutenção
                </h1>
                <p className="text-slate-400 font-medium max-w-md">
                    {config.maintenanceMessage}
                </p>
                {config.supportPhone && (
                    <p className="text-slate-500 text-sm mt-6">
                        Contato: {config.supportPhone}
                    </p>
                )}
            </div>
        );
    }

    return (
        <SystemConfigContext.Provider value={config}>
            {children}
        </SystemConfigContext.Provider>
    );
}