import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import { Search, Flame } from "lucide-react";
import TelegramBanner from "../components/TelegramBanner";
import InstallPWA from "../components/InstallPWA";
import BottomNavigation from "../components/BottomNavigation";
import Footer from "../components/Footer";

export const viewport = {
  themeColor: "#070b14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL("https://education-platform-fawn-six.vercel.app"),
  title: {
    default: "EduAI Pro - दिशा 20-20 राजस्थान GK, स्मार्ट नोट्स, 100 PYQ व मॉक टेस्ट",
    template: "%s | EduAI Pro"
  },
  description: "RPSC, RSMSSB, CET, REET Mains 2026 हेतु राजस्थान का इतिहास, कला, संस्कृति, भूगोल, अर्थव्यवस्था एवं राजव्यवस्था के टॉपिकवाइज़ 100 PYQ, 50 MCQ व स्मार्ट नोट्स।",
  manifest: "/manifest.json",
  keywords: [
    "Rajasthan GK in Hindi",
    "Disha 2020 Rajasthan GK",
    "RPSC PYQ Previous Year Questions",
    "RSMSSB CET Mock Test 2026",
    "REET Mains Smart Notes",
    "Rajasthan History Geography Polity MCQ"
  ],
  authors: [{ name: "EduAI Pro Team" }],
  creator: "EduAI Pro",
  publisher: "EduAI Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "EduAI Pro - राजस्थान प्रतियोगी परीक्षाओं की सम्पूर्ण तैयारी",
    description: "दिशा 20-20 टॉपिकवाइज़ नोट्स, 100% सटीक PYQ, स्पीड टेस्ट एवं 24/7 AI ट्यूटर सपोर्ट।",
    url: "https://education-platform-fawn-six.vercel.app",
    siteName: "EduAI Pro",
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduAI Pro - राजस्थान GK व मॉक टेस्ट",
    description: "दिशा 20-20 अनुसार राजस्थान सामान्य ज्ञान, टू-द-पॉइंट नोट्स व पिछले वर्षों के प्रश्न।",
  },
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
        <Script
          id="google-analytics"
          strategy="lazyOnload"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9DVDLMZYJM');
          `}
        </Script>
      </head>
      <body className="bg-[#070b14] text-slate-100 min-h-screen antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">

        {/* Modern Compact Header */}
        <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-2.5">
          <Link href="/" aria-label="EduAI Pro होमपेज पर जाएँ" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-500/30 group-hover:scale-105 transition">
              E
            </div>
            <div className="flex items-center gap-1">
              <span className="font-black text-white text-base tracking-tight">EduAI</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </div>
          </Link>

          <Link
            href="/search"
            aria-label="विषय या अध्याय खोजें"
            className="flex-1 max-w-xs flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate text-[11px]">खोजें: विषय, अध्याय...</span>
          </Link>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div aria-label="डेली स्ट्रीक स्कोर 12 दिन" className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>12</span>
            </div>
          </div>
        </header>

        {/* Install PWA Banner */}
        <InstallPWA />

        {/* Main Body Content */}
        <main className="flex-1 pt-2">
          {children}
        </main>

        {/* Telegram Banner */}
        <TelegramBanner />

        {/* Footer */}
        <Footer />

        {/* Safe space for fixed mobile UI */}
        <div className="h-36" aria-hidden="true" />

        {/* Bottom Navigation */}
        <BottomNavigation />
      </body>
    </html>
  );
}