import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutClient from "./layout-client";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import SessionTimeoutProvider from "@/components/providers/SessionTimeoutProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vvsprompts.com"),
  title: "Soft Life Software to get the Hyper Realistic AI Influencer bag.",
  description: "Stop Guessing. Start Posting. Generate viral luxury content prompts with Black Luxury aesthetics.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Soft Life Software to get the Hyper Realistic AI Influencer bag.",
    description: "Stop Guessing. Start Posting. Generate viral luxury content prompts with Black Luxury aesthetics.",
    type: "website",
    url: "https://vvsprompts.com",
    siteName: "VVS Prompts",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VVS Prompts - Very Very Sophisticated Prompts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soft Life Software to get the Hyper Realistic AI Influencer bag.",
    description: "Stop Guessing. Start Posting. Generate viral luxury content prompts with Black Luxury aesthetics.",
    images: ["/og-image.png"],
  },
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

