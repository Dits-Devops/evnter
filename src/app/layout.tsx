import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { AlertProvider } from "@/context/AlertContext";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EVNTER - Platform Tiket Event",
  description: "Platform tiket event yang mudah dan menyenangkan",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={font.className}>
        <AuthProvider>
          <ToastProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
