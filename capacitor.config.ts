import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'br.gov.brodowski.chamados',
    appName: 'TI Brodowski',
    // Aponta para o site já publicado na Vercel
    server: {
        url: 'https://brodowski-chamados.vercel.app',
        cleartext: false,
    },
    android: {
        allowMixedContent: false,
        backgroundColor: '#020617',
    },
    ios: {
        contentInset: 'automatic',
        backgroundColor: '#020617',
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#020617',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
        },
    },
};

export default config;