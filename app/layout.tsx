import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
  title: "LumenForge — Run your freelance business in one place",
  description:
    "Client management, project tracking, invoicing, and tasks — beautifully integrated for freelancers.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  keywords: [
    "freelance",
    "project management",
    "invoicing",
    "client portal",
    "SaaS",
    "freelancer tools",
    "business management",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "LumenForge",
    title: "LumenForge — Run your freelance business in one place",
    description:
      "Project management, client portal, invoicing, and AI assistance — all in a beautiful, secure workspace built for independent professionals.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "LumenForge — Run your freelance business in one place",
    description:
      "Project management, client portal, invoicing, and AI assistance — all in a beautiful, secure workspace.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            enableColorScheme={false}
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
