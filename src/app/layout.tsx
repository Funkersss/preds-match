import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Predict the Match — World Cup 2026",
  description:
    "Predict Norway's World Cup 2026 Group I results and win promo codes.",
  keywords: ["World Cup 2026", "predictions", "Norway", "football"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <div className="flex flex-col flex-1">{children}</div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #DDE3ED",
              color: "#1A1D2E",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              borderRadius: "0.75rem",
            },
          }}
        />
      </body>
    </html>
  );
}
