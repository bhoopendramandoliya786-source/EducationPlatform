import Link from "next/link";

export default function Footer() {
  const links = [
    { href: "/about", label: "हमारे बारे में" },
    { href: "/contact", label: "संपर्क करें" },
    { href: "/privacy-policy", label: "गोपनीयता नीति" },
    { href: "/terms", label: "नियम एवं शर्तें" },
    { href: "/disclaimer", label: "अस्वीकरण" },
  ];

  return (
    <footer className="border-t border-slate-800 bg-[#070b14] px-4 pt-8 pb-56">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-lg font-black text-white">EduAI Pro</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
            राजस्थान की प्रतियोगी परीक्षाओं की बेहतर तैयारी के लिए नोट्स,
            प्रश्न, PYQ और अभ्यास सामग्री।
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-400 transition hover:text-indigo-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} EduAI Pro. सर्वाधिकार सुरक्षित।
        </div>
      </div>
    </footer>
  );
}
