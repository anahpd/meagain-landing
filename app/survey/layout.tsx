import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MeAgain Survey — Help shape our support",
  description:
    "Share your experience to help shape MeAgain support for women managing treatment-induced menopause after breast cancer.",
  openGraph: {
    title: "MeAgain Survey",
    description:
      "Anonymous survey to inform support programmes for women managing early-onset menopause following breast cancer treatment.",
    url: "https://mymeagain.ie/survey",
    siteName: "MeAgain",
  },
};

export default function SurveyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
