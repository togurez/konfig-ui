import "./globals.css";
import type { Metadata } from "next";
import { Caveat, Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import Link from "next/link";
import { Auth0Provider } from "@auth0/nextjs-auth0";

const inter = Inter({ subsets: ["latin"], variable: "--font-ui" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-sketch" });

export const metadata: Metadata = {
  title: "Konfig",
  description: "Settings management dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <body className={`${inter.variable} ${mono.variable} ${caveat.variable} font-ui`}>
        <Auth0Provider>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('kf_theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="flex items-center gap-4 px-5 py-3 border-b border-dashed border-line-2">
              <nav className="flex gap-1 font-sketch text-[17px]">
                <Link href="/" className="px-3 py-1.5 text-text-dim hover:text-text">List</Link>
                <Link href="/palette" className="px-3 py-1.5 text-text-dim hover:text-text">Palette</Link>
                <Link href="/detail" className="px-3 py-1.5 text-text-dim hover:text-text">Detail</Link>
              </nav>
              <div className="ml-auto flex items-center gap-3">
                <UserMenu />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
        </Auth0Provider>
      </body>
    </html>
  );
}
