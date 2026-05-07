import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import { TLP } from "@/lib/theme/tokens";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mentora",
  description: "The LMS platform for learning academies",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body>
        <NextTopLoader 
          color={TLP.teal}
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow={`0 0 10px ${TLP.teal},0 0 5px ${TLP.teal}`}
        />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
