import type { Metadata } from "next";
import { Fraunces, Syne, Epilogue, JetBrains_Mono } from "next/font/google";
import { PageShell } from "@/components/layout/PageShell";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const epilogue = Epilogue({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ghost in the Repo",
    template: "%s | Ghost in the Repo",
  },
  description:
    "The complete reference for software engineers who want to understand everything, deeply.",
  keywords: [
    "software engineering",
    "computer science",
    "cheatsheets",
    "algorithms",
    "systems design",
    "networking",
    "operating systems",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${syne.variable} ${epilogue.variable} ${jetbrainsMono.variable}`}
    >
      <body>
          <PageShell>{children}</PageShell>
        </body>
    </html>
  );
}
