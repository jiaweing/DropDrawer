import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DropDrawer - A responsive dropdown/drawer component for shadcn/ui",
  description:
    "A responsive component that automatically switches between a dropdown menu on desktop and a drawer on mobile devices for shadcn/ui",
  keywords: [
    "dropdown menu",
    "drawer",
    "responsive",
    "mobile-friendly",
    "shadcn/ui",
    "React",
    "Next.js",
    "UI component",
    "TypeScript",
    "Tailwind CSS",
  ],
  authors: [
    {
      name: "Jay",
      url: "https://github.com/jiaweing",
    },
  ],
  creator: "Jay",
  publisher: "Jay",
  metadataBase: new URL("https://dropdrawer.jiawei.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dropdrawer.jiawei.dev",
    title: "DropDrawer - A responsive dropdown/drawer component for shadcn/ui",
    description:
      "A responsive component that automatically switches between a dropdown menu on desktop and a drawer on mobile devices for shadcn/ui",
    siteName: "DropDrawer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DropDrawer - A responsive dropdown/drawer component for shadcn/ui",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DropDrawer - A responsive dropdown/drawer component for shadcn/ui",
    description:
      "A responsive component that automatically switches between a dropdown menu on desktop and a drawer on mobile devices for shadcn/ui",
    images: ["/og-image.png"],
    creator: "@jiaweing",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#242424" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="dropdrawer-theme">
          <div vaul-drawer-wrapper="" className="bg-background">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
