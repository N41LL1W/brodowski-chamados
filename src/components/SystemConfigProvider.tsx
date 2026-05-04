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

// Variáveis CSS do tema claro (defaults)
const LIGHT_DEFAULTS: Record<string, string> = {
    '--bg-primary':    '#f9fafb',
    '--bg-secondary':  '#ffffff',
    '--text-primary':  '#111827',
    '--text-secondary':'#4b5563',
    '--border-color':  '#e5e7eb',
    '--brand-color':   '#2563eb',
};

// Variáveis CSS do tema escuro (defaults)
const DARK_DEFAULTS: Record<string, string> = {
    '--bg-primary':    '#020617',
    '--bg-secondary':  '#0f172a',
    '--text-primary':  '#f8fafc',
    '--text-secondary':'#94a3b8',
    '--border-color':  '#1e293b',
    '--brand-color':   '#3b82f6',
};

const SystemConfigContext = createContext<SystemConfig>(DEFAULTS);

export function useSystemConfig() {
    return useContext(SystemConfigContext);
}

function applyThemeVars(theme: 'light' | 'dark', vars: Record<string, string>) {
    const defaults = theme === 'light' ? LIGHT_DEFAULTS : DARK_DEFAULTS;
    const root = document.documentElement;
    const merged = { ...defaults, ...vars };

    // Aplica as variáveis
    Object.entries(merged).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // Sincroniza --brand-color com o tema escuro/claro
    if (theme === 'light' && !document.documentElement.classList.contains('dark')) {
        root.style.setProperty('--brand-color', merged['--brand-color']);
    } else if (theme === 'dark' && document.documentElement.classList.contains('dark')) {
        root.style.setProperty('--brand-color', merged['--brand-color']);
    }
}

export default function SystemConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<SystemConfig>(DEFAULTS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch('/api/system-config')
            .then(r => r.json())
            .then(data => {
                const sys = data.system || {};
                const themes = data.themes || {};

                setConfig({ ...DEFAULTS, ...sys });

                // Aplica tema claro
                if (themes.light) applyThemeVars('light', themes.light);
                // Aplica tema escuro
                if (themes.dark) applyThemeVars('dark', themes.dark);

                // Aplica cor primária do sistema
                if (sys.primaryColor) {
                    document.documentElement.style.setProperty('--brand-color', sys.primaryColor);
                }
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    // Modo manutenção
    if (loaded && config.maintenanceMode === 'true') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-xl mb-6">
                    {config.logoText || 'TI'}
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">
                    Sistema em Manutenção
                </h1>
                <p className="text-slate-400 font-medium max-w-md">{config.maintenanceMessage}</p>
                {config.supportPhone && (
                    <p className="text-slate-500 text-sm mt-6">Contato: {config.supportPhone}</p>
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