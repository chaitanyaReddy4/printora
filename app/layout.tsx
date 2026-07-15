import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Printora — Print anything. Perfectly.",
    template: "%s | Printora",
  },
  description:
    "Custom printing store in Vijayawada. T-shirts, hoodies, mugs, visiting cards, banners & more. Design online or upload. 48hr turnaround, pan-India delivery.",
  keywords: [
    "custom printing",
    "t-shirt printing",
    "visiting cards",
    "banner printing",
    "Vijayawada",
    "custom merchandise",
    "batch orders",
    "photo printing",
  ],
  authors: [{ name: "Printora" }],
  creator: "Printora",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://printora.in",
    siteName: "Printora",
    title: "Printora — Print anything. Perfectly.",
    description:
      "Custom printing store in Vijayawada. Design online, upload artwork, or let us design for you. 48hr turnaround, pan-India delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Printora — Print anything. Perfectly.",
    description: "Custom printing store — T-shirts, mugs, banners & more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
      className={`${jakartaSans.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
