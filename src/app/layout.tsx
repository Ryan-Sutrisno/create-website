import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SolanaProvider } from "@/components/SolanaProvider"
import { Navbar } from "@/components/Navbar"
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css"
import { TabsProvider } from '@/context/TabsProvider'

export const metadata: Metadata = {
  title: "AI Project Hub",
  description: "Create, showcase, and deploy AI-powered applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-[#0A0A0A] text-white antialiased">
        <SolanaProvider>
          <TabsProvider>
            <Navbar />
            <div className="h-[calc(100vh-4rem)] pt-16 overflow-hidden">
        {children}
            </div>
          </TabsProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
