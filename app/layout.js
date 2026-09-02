import "./globals.css";
import Script from "next/script";
import AppShell from "./components/AppShell";

export const viewport = {
  themeColor: "#06090e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL("https://education-platform-fawn-six.vercel.app"),
  title: {
    default: "EduAI Pro - राजस्थान GK, स्मार्ट नोट्स व CBT मॉक टेस्ट",
    template: "%s | EduAI Pro"
  },
  description: "RPSC, RSMSSB, CET, REET 2026 हेतु राजस्थान का इतिहास, भूगोल, राजव्यवस्था के टॉपिकवाइज़ 100 PYQ, 50 MCQ व स्मार्ट नोट्स।",
  manifest: "/manifest.json",
  keywords: [
    "Rajasthan GK in Hindi",
    "Disha 2020 Rajasthan GK",
    "RPSC PYQ Previous Year Questions",
    "RSMSSB CET Mock Test 2026",
    "REET Mains Smart Notes"
  ],
  authors: [{ name: "EduAI Pro Team" }],
  creator: "EduAI Pro",
  publisher: "EduAI Pro",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "EduAI Pro",
    "url": "https://education-platform-fawn-six.vercel.app",
    "description": "राजस्थान प्रतियोगी परीक्षाओं हेतु स्मार्ट नोट्स, मॉक टेस्ट एवं PYQ प्रश्न बैंक।",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All"
  };

  return (
    <html lang="hi" className="dark">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-9DVDLMZYJM"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9DVDLMZYJM');
          `}
        </Script>
      </head>
      <body className="bg-[#06090e] text-slate-100 min-h-screen antialiased flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}