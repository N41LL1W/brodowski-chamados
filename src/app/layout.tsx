import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import AuthProvider from "./providers";

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
    <html lang="pt-BR" suppressHydrationWarning className="antialiased">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col">
            <Navbar /> 
            {/* O pt-16 compensa a altura da Navbar fixa */}
            <main className="flex-1 pt-16 md:pt-20">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}