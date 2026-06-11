import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd, websiteSchema } from "@/components/json-ld";
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
  metadataBase: new URL("https://myteampredictions.com"),
  title: "MyTeamPredictions — World Cup 2026 Match Predictions",
  description:
    "Predict every match at the 2026 FIFA World Cup. Follow Norway, Sweden, Finland and 48 teams competing in North America. Sign in and make your predictions now.",
  keywords: [
    "World Cup 2026",
    "predictions",
    "Norway",
    "Sweden",
    "Finland",
    "football",
  ],
  openGraph: {
    type: "website",
    siteName: "MyTeamPredictions",
    title: "MyTeamPredictions — World Cup 2026 Match Predictions",
    description:
      "Predict every match at the 2026 FIFA World Cup. Follow Norway, Sweden, Finland and 48 teams competing in North America.",
    url: "https://myteampredictions.com/",
    images: [
      {
        url: "https://myteampredictions.com/og-home.png",
        width: 1200,
        height: 630,
        alt: "MyTeamPredictions — World Cup 2026 Match Predictions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyTeamPredictions — World Cup 2026 Match Predictions",
    description:
      "Predict every match at the 2026 FIFA World Cup. Follow Norway, Sweden, Finland and 48 teams competing in North America.",
    images: ["https://myteampredictions.com/og-home.png"],
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
      className={`${bricolage.variable} ${instrument.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5MKN63Z2"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5MKN63Z2');`}
        </Script>
        {/* End Google Tag Manager */}

        <JsonLd data={websiteSchema} />

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
