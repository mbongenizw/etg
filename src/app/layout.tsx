import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { NetworkStatusHandler, OfflineBanner } from "@/components/ui/network-status";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETG Agri Inputs - Fleet Management",
  description: "Comprehensive fleet and vehicle management system for ETG Agri Inputs",
  keywords: ["Vehicle Management", "Fleet Management", "ETG", "Fleet Tracking", "Agri Inputs"],
  authors: [{ name: "ETG Team" }],
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <NetworkStatusHandler />
          <OfflineBanner />
          {children}
        </AuthProvider>
        <Toaster />
        <SonnerToaster 
          position="top-right" 
          richColors
          expand={true}
          closeButton
          duration={4000}
        />
      </body>
    </html>
  );
}
