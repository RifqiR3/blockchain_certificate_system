import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/providers";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SealChain",
    template: "%s | SealChain",
  },
  description: "Blockchain Certificate Management System",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
