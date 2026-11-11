import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acadza Fix-Loop | Faculty Review Console",
  description: "Autonomous Report → Fix Triage Engine and Faculty Review Console for Acadza EdTech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
