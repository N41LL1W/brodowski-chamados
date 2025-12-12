// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import AuthProvider from "./providers"; // IMPORTAR o AuthProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistema",
  description: "Sistema",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        
        {/* ENVOLVER TUDO COM O AUTH PROVIDER */}
        <AuthProvider>
          
          <Navbar /> 

          <main className="min-h-screen pt-24 flex items-center justify-center">
            {children}
          </main>
        
        </AuthProvider>
       
      </body>
    </html>
  );
}