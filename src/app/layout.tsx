import "./globals.css";
import type { Metadata } from "next";
import { Kanit, Sora } from "next/font/google";
import Providers from "@/components/Providers";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
  weight: ["400", "700"],
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Feel With You",
  description: "Next.js with Tailwind and Google Fonts",
  icons: {
    icon: "/favicon-v2.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={kanit.variable}>
      <body className="font-sora">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
