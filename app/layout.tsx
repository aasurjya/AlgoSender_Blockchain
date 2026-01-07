import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/contexts/WalletContext";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "AlgoSender - Algorand Transaction Manager",
  description: "Send and track Algorand TestNet transactions with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider defaultTheme="dark" storageKey="algosender-theme">
          <WalletProvider>
            <Layout>
              {children}
            </Layout>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
