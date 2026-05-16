import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeAgain - Menopause Support During Breast Cancer Treatment",
  description:
    "MeAgain is being developed to help women prepare for and stabilise menopause symptoms across the breast cancer treatment journey",
  openGraph: {
    title: "MeAgain - Menopause Support During Breast Cancer Treatment",
    description:
      "MeAgain is being developed to help women prepare for and stabilise menopause symptoms across the breast cancer treatment journey",
    url: "https://mymeagain.ie",
    siteName: "MeAgain",
  },
  icons: {
    icon: [
      // PNG first: Chromium / WebKit sometimes skip oddly-encoded ICO favicons but accept PNG.
      {
        url: "/meagain_icon.png",
        type: "image/png",
        sizes: "1024x1024",
      },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    shortcut: ["/meagain_icon.png"],
    apple: [{ url: "/meagain_icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
