import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import AuthProvider from "./providers";
import SystemConfigProvider from "@/components/SystemConfigProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
});

export const metadata = {
    title: "TI Brodowski | Central de Chamados",
    description: "Sistema oficial de chamados técnicos da Prefeitura Municipal de Brodowski",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
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