import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutClient from "./layout-client";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import SessionTimeoutProvider from "@/components/providers/SessionTimeoutProvider";

export const metadata: Metadata = {
  title: "VVS Prompts: Soft Life Software for the Hyper-Realistic AI Influencer",
  description: "Generate and Monetize Viral luxury content prompts with Modern Luxury aesthetics - No Guesswork.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VVS Prompts",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#D4AF37",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <AuthProvider>
          <SessionTimeoutProvider>
            <LayoutClient>
              <Header />
              {children}
            </LayoutClient>
          </SessionTimeoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

