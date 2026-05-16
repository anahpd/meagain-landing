import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeAgain - Support for women affected by breast cancer",
  description: "MeAgain is being developed to help women prepare for and stabilise menopause symptoms across the breast cancer treatment journey",
  openGraph: {
    title: "MeAgain - Support for women affected by breast cancer",
    description: "MeAgain is being developed to help women prepare for and stabilise menopause symptoms across the breast cancer treatment journey",
    url: "https://mymeagain.ie",
    siteName: "MeAgain",
  },
  icons: {
    icon: "/meagain_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
