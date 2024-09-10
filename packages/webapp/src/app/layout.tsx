import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AntdConfiguration from "@/components/antd-configuration";
import { QueryProvider } from "@/components/query-provider";
import { brand } from "@/lib/content/branding";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: brand.serviceName,
  description: brand.serviceDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AntdConfiguration>
            <main className="h-screen w-screen overflow-auto bg-background">{children}</main>
          </AntdConfiguration>
        </QueryProvider>
      </body>
    </html>
  );
}
