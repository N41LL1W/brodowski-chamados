import { useEffect, useState } from 'react';

export interface SystemConfig {
    systemName: string;
    systemSubtitle: string;
    cityName: string;
    supportPhone: string;
    supportEmail: string;
    primaryColor: string;
    logoText: string;
}

const DEFAULTS: SystemConfig = {
    systemName: 'TI BRODOWSKI',
    systemSubtitle: 'Central de Operações',
    cityName: 'Brodowski',
    supportPhone: '',
    supportEmail: '',
    primaryColor: '#2563eb',
    logoText: 'TI',
};

export function useSystemConfig() {
    const [config, setConfig] = useState<SystemConfig>(DEFAULTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/master/config')
            .then(r => r.json())
            .then(data => {
                if (data.system) {
                    setConfig({
                        systemName:    data.system.systemName    || DEFAULTS.systemName,
                        systemSubtitle: data.system.systemSubtitle || DEFAULTS.systemSubtitle,
                        cityName:      data.system.cityName      || DEFAULTS.cityName,
                        supportPhone:  data.system.supportPhone  || DEFAULTS.supportPhone,
                        supportEmail:  data.system.supportEmail  || DEFAULTS.supportEmail,
                        primaryColor:  data.system.primaryColor  || DEFAULTS.primaryColor,
                        logoText:      data.system.logoText      || DEFAULTS.logoText,
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return { config, loading };
}