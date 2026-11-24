import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GlobalBeleWidget from "@/components/GlobalBeleWidget";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#142420",
};

export const metadata: Metadata = {
  title: "JustMobile | Less telco. More you.",
  description:
    "Australia's straightforward mobile challenger. Simple SIM & eSIM plans, flagship smartphones, and transparent pricing without the telco nonsense.",
  icons: {
    icon: "/brand/logos/favicon.ico",
    apple: "/brand/logos/app-icon-512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Suspense fallback={null}>
            <GlobalBeleWidget />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
