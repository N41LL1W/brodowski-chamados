// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistema",
  description: "Sistema",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Navbar />
        {/* pt-20 (padding-top: 5rem ou 80px) para afastar o conteúdo da Navbar */}
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}