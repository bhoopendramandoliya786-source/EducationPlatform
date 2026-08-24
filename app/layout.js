import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import { Home, BookOpen, Sparkles, Trophy, User, Search, Flame } from "lucide-react";
import TelegramBanner from "../components/TelegramBanner";
import InstallPWA from "../components/InstallPWA";

export const metadata = {
  metadataBase: new URL("https://education-platform-fawn-six.vercel.app"),
  title: {
    default: "EduAI Pro - दिशा 20-20 राजस्थान GK, स्मार्ट नोट्स, 100 PYQ व मॉक टेस्ट",
    template: "%s | EduAI Pro"
  },
  description: "RPSC, RSMSSB, CET, REET Mains 2026 हेतु राजस्थान का इतिहास, कला, संस्कृति, भूगोल, अर्थव्यवस्था एवं राजव्यवस्था के टॉपिकवाइज़ 100 PYQ, 50 MCQ व स्मार्ट नोट्स।",
  manifest: "/manifest.json",
  themeColor: "#070b14",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-9DVDLMZYJM"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9DVDLMZYJM', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="bg-[#070b14] text-slate-100 min-h-screen antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white">

        <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              E
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base tracking-tight">EduAI</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </div>
          </Link>

          <Link
            href="/search"
            className="flex-1 max-w-sm flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800/90 text-xs text-slate-400 hover:border-indigo-500/50 hover:text-slate-200 transition shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate text-[11px]">खोजें: विषय, अध्याय या टॉपिक...</span>
          </Link>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>12</span>
            </div>
            <Link
              href="/student"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">प्रोफाइल</span>
            </Link>
          </div>
        </header>

        <InstallPWA />

        <main className="flex-1 pb-24 pt-2">
          {children}
        </main>

        <TelegramBanner />

        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#090e1a]/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 flex items-center justify-around">
          <Link href="/" className="flex items-center flex-col text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">होम</span>
          </Link>
          <Link href="/notes" className="flex items-center flex-col text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">नोट्स</span>
          </Link>
          <Link href="/student" className="flex items-center flex-col -mt-5 group active:scale-95 transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 group-hover:scale-105 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 mt-1">AI ट्यूटर</span>
          </Link>
          <Link href="/quiz" className="flex items-center flex-col text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">टेस्ट</span>
          </Link>
          <Link href="/student" className="flex items-center flex-col text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">प्रोफाइल</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
