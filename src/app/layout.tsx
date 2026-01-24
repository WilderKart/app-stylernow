import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stylernow",
  description: "Plataforma de gestión para barberías",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-pure-black text-gray-100 antialiased`}>
        {/* Force dark class on html, remove script if we want permanent dark mode, 
            but for now hardcoding className='dark' on html is safest strictly for this phase */}

        <div className="flex justify-center min-h-screen bg-black"> {/* Outer wrapper black */}
          <main className="w-full min-h-screen bg-pure-black shadow-2xl relative flex flex-col">
            {children}
            {/* ThemeToggle removed to enforce Premium identity */}
          </main>
        </div>
      </body>
    </html>
  );
}
