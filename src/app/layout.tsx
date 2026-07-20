import type { Metadata } from "next";
import "./globals.css";
import { CallOverlay } from "@/components/CallOverlay";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Sentinel AI - Cybersecurity Defense",
  description: "Continuous AI-powered fraud protection running invisibly in the background.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-sans">
        <Providers>
          {children}
          <CallOverlay />
        </Providers>
      </body>
    </html>
  );
}

