import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Folio | Your CV is a PDF. It shouldn't be.",
  description: "Create a beautiful public profile page recruiters actually click. Stop sending boring PDF resumes. Build a Folio instead.",
  openGraph: {
    title: "Folio | Your CV is a PDF. It shouldn't be.",
    description: "Create a beautiful public profile page recruiters actually click.",
    type: "website",
    siteName: "Folio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Folio | Your CV is a PDF. It shouldn't be.",
    description: "Create a beautiful public profile page recruiters actually click.",
  },
  icons: {
    icon: "/folio-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-page text-primary">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
