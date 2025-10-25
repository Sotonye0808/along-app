import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdProvider } from "./providers/AntdProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Along - Share Your Routes",
  description: "Discover and share amazing travel routes with the community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
