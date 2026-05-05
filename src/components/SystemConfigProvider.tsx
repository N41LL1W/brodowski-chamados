"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

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

const LIGHT_DEFAULTS: Record<string, string> = {
    '--bg-primary':     '#f9fafb',
    '--bg-secondary':   '#ffffff',
    '--text-primary':   '#111827',
    '--text-secondary': '#4b5563',
    '--border-color':   '#e5e7eb',
    '--brand-color':    '#2563eb',
};

const DARK_DEFAULTS: Record<string, string> = {
    '--bg-primary':     '#020617',
    '--bg-secondary':   '#0f172a',
    '--text-primary':   '#f8fafc',
    '--text-secondary': '#94a3b8',
    '--border-color':   '#1e293b',
    '--brand-color':    '#3b82f6',
};

const SystemConfigContext = createContext<SystemConfig>(DEFAULTS);

export function useSystemConfig() {
    return useContext(SystemConfigContext);
}

// Aplica as variáveis CSS do tema correto
function applyVarsForCurrentTheme(
    lightVars: Record<string, string>,
    darkVars: Record<string, string>
) {
    const isDark = document.documentElement.classList.contains('dark');
    const vars = isDark ? { ...DARK_DEFAULTS, ...darkVars } : { ...LIGHT_DEFAULTS, ...lightVars };
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
}

export default function SystemConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<SystemConfig>(DEFAULTS);
    const [loaded, setLoaded] = useState(false);
    const [themeVars, setThemeVars] = useState<{
        light: Record<string, string>;
        dark: Record<string, string>;
    }>({ light: {}, dark: {} });

    const applyAll = useCallback((
        light: Record<string, string>,
        dark: Record<string, string>
    ) => {
        applyVarsForCurrentTheme(light, dark);
    }, []);

    useEffect(() => {
        fetch('/api/system-config')
            .then(r => r.json())
            .then(data => {
                const sys = data.system || {};
                const themes = data.themes || {};

                const light = themes.light || {};
                const dark  = themes.dark  || {};

                setConfig({ ...DEFAULTS, ...sys });
                setThemeVars({ light, dark });

                // Aplica imediatamente
                applyAll(light, dark);
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, [applyAll]);

    // Reaplica quando o ThemeToggle muda o tema
    useEffect(() => {
        const handler = () => {
            // Pequeno delay para a classe .dark ser aplicada antes
            requestAnimationFrame(() => {
                applyAll(themeVars.light, themeVars.dark);
            });
        };
        window.addEventListener('themechange', handler);
        return () => window.removeEventListener('themechange', handler);
    }, [themeVars, applyAll]);

    // Modo manutenção — só mostra após carregar para não piscar
    if (loaded && config.maintenanceMode === 'true') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6"
                    style={{ backgroundColor: config.primaryColor || '#2563eb' }}
                >
                    {config.logoText || 'TI'}
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">
                    Sistema em Manutenção
                </h1>
                <p className="text-slate-400 font-medium max-w-md">
                    {config.maintenanceMessage}
                </p>
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