import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutClient from "./layout-client";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Viral Vision - Generate Viral Faceless Content Prompts",
  description: "Stop Guessing. Start Posting. Generate viral faceless content prompts with luxury aesthetics.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Viral Vision",
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
        <LayoutClient>
          <Header />
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}

