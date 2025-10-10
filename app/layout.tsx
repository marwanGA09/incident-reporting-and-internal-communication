// import type { Metadata } from "next";
import { ClerkProvider, SignInButton, SignedOut } from "@clerk/nextjs";

import ToasterProvider from "@/components/Providers/toastProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Incident Reporting and Internal Communication",
    template: "%s | Incident Reporting and Internal Communication",
  },
  description:
    "A platform for reporting incidents and facilitating internal communication within organizations.",
  icons: {
    icon: "/favicon.ico",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {" "}
          <ToasterProvider />
          {/* <header className="flex justify-end items-center p-4 gap-4 h-16"> */}
          <header>
            <SignedOut>
              <SignInButton />
              {/* <SignUpButton /> */}
            </SignedOut>
            {/* <SignedIn>
              <UserButton />
            </SignedIn> */}
          </header>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
