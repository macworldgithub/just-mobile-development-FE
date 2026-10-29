import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
