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
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
                  try {
                    var localStored = localStorage.getItem('theme');
                    if (localStored === 'dark' || (!localStored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                    }
                  } catch (e) {}
                })()`
          }}
        />
        <div className="flex justify-center min-h-screen">
          <main className="w-full max-w-[414px] min-h-screen bg-white dark:bg-gray-900 shadow-2xl relative flex flex-col">
            {children}
            <div className="absolute top-4 right-4 z-50 pointer-events-none">
              <ThemeToggle />
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
