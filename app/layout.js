import "./globals.css";

export const metadata = {
  title: "EducationPlatform AI",
  description:
    "AI powered competitive exam preparation platform with Notes, MCQ, PYQ, Mock Tests and Smart Learning.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050816",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
