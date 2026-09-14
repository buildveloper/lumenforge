import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "LumenForge — The workspace your clients can see",
    template: "%s · LumenForge",
  },
  description:
    "Projects, tasks, and invoices for independent professionals, plus a client portal so you stop sending status updates. AI drafts proposals and summaries from your real project data.",
  keywords: [
    "freelance business software",
    "client portal",
    "freelance invoicing",
    "project management for freelancers",
    "freelance CRM",
    "client management software",
  ],
  applicationName: "LumenForge",
  authors: [{ name: "LumenForge" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "LumenForge",
    title: "LumenForge — The workspace your clients can see",
    description:
      "Projects, tasks, invoices, and AI drafting for independent professionals. Clients get a portal instead of another status email.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "LumenForge — The workspace your clients can see",
    description:
      "Projects, tasks, invoices, and AI drafting for independent professionals. Clients get a portal instead of another status email.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#181614" },
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
