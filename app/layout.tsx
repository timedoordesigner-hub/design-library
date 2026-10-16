import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const sans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timedor Academy Design File Library",
  description: "Database file desain Timedor Academy untuk pencarian dan akses aset.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
