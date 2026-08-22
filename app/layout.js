import './globals.css';

export const metadata = {
  title: 'Education Platform - RAS, REET, CET Exam Prep',
  description: '100% Free Complete Exam Syllabus, Smart Notes, MCQs & Test Engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
