import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { TLP } from "@/lib/theme/tokens";
import LoadingProvider from "@/components/providers/LoadingProvider";
import { Toaster } from "react-hot-toast";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body>
        <LoadingProvider>
          {children}
          <Toaster position="top-right" />
        </LoadingProvider>
      </body>
    </html>
  );
}
