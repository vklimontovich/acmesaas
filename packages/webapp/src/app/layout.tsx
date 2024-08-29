import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import AntdConfiguration from "@/components/antd-configuration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Statement.sh",
  description: "Consolidate all your credit and debit card statements in one place",
};

const antdTheme = {
  token: {
    colorPrimary: "hsl(243, 57%, 40%)", // --color-primary
    shadow: "none",
    // colorPrimaryHover: 'hsl(243, 88%, 75%)', // --color-primary-light
    // colorPrimaryActive: 'hsl(244, 49%, 20%)', // --color-primary-dark
    // colorPrimaryDisabled: 'hsl(235, 88%, 83%)', // --color-primary-disabled,
    //
    // colorTextBase: 'hsl(216, 28%, 23%)', // --color-foreground
    // colorText: 'hsl(222, 86%, 5%)', // --color-foreground-dark
    // colorTextSecondary: 'hsl(215, 21%, 58%)', // --color-foreground-light
    // colorTextDisabled: 'hsl(213, 27%, 84%)', // --color-foreground-disabled
    //
    // colorBgBase: '#f8fafc', // --color-background
    // colorBgContainer: 'hsl(213, 27%, 84%)', // --color-background-dark
    // colorBgElevated: 'hsl(0, 0%, 100%)', // --color-background-light
    //
    // colorError: 'hsl(0, 74%, 57%)', // --color-foreground-error
    // colorSuccess: 'hsl(134, 61%, 48%)', // --color-foreground-success
    // colorWarning: 'hsl(24, 73%, 49%)', // --color-foreground-warning
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdConfiguration>
          <ConfigProvider theme={antdTheme}>
            <main className="h-screen w-screen overflow-auto bg-background">{children}</main>
          </ConfigProvider>
        </AntdConfiguration>
      </body>
    </html>
  );
}
