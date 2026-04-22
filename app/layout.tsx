import type { Metadata, Viewport } from "next";
import "./globals.css";
// import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

// const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "ReySil — Gestion de Viajes",
  description:
    "Sistema de gestion de viajes para Transportes ReySil. Portal cliente, panel operadores y PWA chofer.",
  manifest: "/manifest.json",
  applicationName: "ReySil",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ReySil",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#DC2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className="font-sans">
      <body className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
