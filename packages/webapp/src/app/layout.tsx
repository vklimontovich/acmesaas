import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Statement.sh",
  description: "Consolidate all your credit and debit card statements in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider
          theme={{
            token: {
              // colorPrimary: "#115e59",
              // borderRadius: 2,
              // colorBgContainerDisabled: "#f0f0f0",
              // Seed Token
              colorPrimary: "#0f766e",
              //borderRadius: 2,

              // Alias Token
              colorBgContainer: "transparent",
            },
          }}
        >
          <AntdRegistry>
            <div className="h-screen w-screen overflow-auto bg-teal-50">{children}</div>
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
