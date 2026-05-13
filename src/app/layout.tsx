import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import AuthProvider from "./providers";
import SystemConfigProvider from "@/components/SystemConfigProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "TI Brodowski | Central de Chamados",
    description: "Sistema oficial de chamados técnicos da Prefeitura Municipal de Brodowski",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "TI Brodowski",
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: "website",
        siteName: "TI Brodowski",
        title: "TI Brodowski | Central de Chamados",
        description: "Sistema oficial de chamados técnicos",
    },
};

export const viewport: Viewport = {
    themeColor: "#2563eb",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json"/>
                <link rel="apple-touch-icon" href="/icon-192.png"/>
                <meta name="apple-mobile-web-app-capable" content="yes"/>
                <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
                <meta name="apple-mobile-web-app-title" content="TI Brodowski"/>
                <meta name="mobile-web-app-capable" content="yes"/>
                <meta name="msapplication-TileColor" content="#2563eb"/>
                <meta name="msapplication-tap-highlight" content="no"/>
            </head>
            <body className={`${inter.variable} font-sans`}>
                <AuthProvider>
                    <SystemConfigProvider>
                        <div className="relative min-h-screen flex flex-col">
                            <Navbar/>
                            <main className="flex-1">
                                {children}
                            </main>
                        </div>
                    </SystemConfigProvider>
                </AuthProvider>
            </body>
        </html>
    );
}