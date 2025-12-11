import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import SessionProvider from "@/components/SessionProvider";
import ToastProvider from "@/components/ToastProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Personal Blog - Hardik Dadhich",
    template: "%s | Personal Blog",
  },
  description: "Hardik Dadhich personal space for sharing thoughts on software development, System design & technology & continuous learning.",
  keywords: ["blog", "software development", "web development", "technology", "programming"],
  authors: [{ name: "Hardik Dadhich" }],
  creator: "Hardik Dadhich",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hardikdadhich.com/",
    title: "Personal Blog - Hardik Dadhich",
    description: "A personal space for sharing thoughts on software development, technology, and continuous learning.",
    siteName: "Personal Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Blog - Hardik Dadhich",
    description: "A personal space for sharing thoughts on software development, technology, and continuous learning.",
    creator: "@hardikdadhich",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider />
            <Navigation />
            <main className="flex-grow">
              {children}
              <SpeedInsights />
            </main>
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
