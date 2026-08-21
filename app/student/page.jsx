import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

export const revalidate = 0;

export default async function StudentPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Profile Info
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Fetch Progress & Quiz Stats
  const { count: completedTopics } = await supabase
    .from("progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true);

  const { count: quizAttempts } = await supabase
    .from("attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 3. Fetch Recent Studied Topic
  const { data: lastStudy } = await supabase
    .from("progress")
    .select(`
      topic_id,
      topics(
        name,
        chapters(
          name,
          subjects(name)
        )
      )
    `)
    .eq("user_id", user.id)
    .order("last_studied_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // XP Calculation
  const totalXp = ((completedTopics || 0) * 50) + ((quizAttempts || 0) * 20);

  return (
    <main className="min-h-screen bg-[#070b14] text-white py-6 px-4 md:px-8 max-w-7xl mx-auto pb-24">
      
      {/* 1. VIP HERO PROFILE HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-purple-950/60 border border-blue-500/20 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-500/20">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  FREE PLAN
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  🔥 7 Days Streak
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 mt-2">
                नमस्ते, {profile?.full_name || "Student"} 👋
              </h1>
              <p className="text-sm text-slate-400 font-medium">{profile?.email || user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <Link 
              href="/subject" 
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
            >
              👑 Go VIP (Coming Soon)
            </Link>
            <LogoutButton />
          </div>
        </div>
      </section>

      {/* 2. STATS & ANALYTICS GRID */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>COMPLETED TOPICS</span>
            <span className="text-lg">📚</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white mt-2">
            {completedTopics || 0}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>QUIZ ATTEMPTS</span>
            <span className="text-lg">🎯</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-cyan-400 mt-2">
            {quizAttempts || 0}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>TOTAL SCORE (XP)</span>
            <span className="text-lg">⚡</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-amber-400 mt-2">
            {totalXp} <span className="text-xs text-amber-500/80">XP</span>
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>LAST STUDIED</span>
            <span className="text-lg">⏱️</span>
          </div>
          <p className="text-sm font-bold text-slate-200 mt-3 truncate">
            {lastStudy?.topics?.name || "शुरुआत करें"}
          </p>
        </div>
      </section>

      {/* 3. RESUME LEARNING BANNER */}
      {lastStudy && (
        <section className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-900/80 border border-indigo-500/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30">📖</span>
            <div>
              <p className="text-xs text-indigo-400 font-bold uppercase">पिछला अधूरा टॉपिक</p>
              <h3 className="text-lg font-black text-white mt-0.5">{lastStudy.topics.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lastStudy.topics?.chapters?.subjects?.name || "Subject"} ➔ {lastStudy.topics?.chapters?.name || "Chapter"}
              </p>
            </div>
          </div>
          <Link
            href={`/topic/${lastStudy.topic_id}`}
            className="w-full md:w-auto text-center px-6 py-2.5 rounded-xl font-black text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            Continue Learning ▶
          </Link>
        </section>
      )}

      {/* 4. MAIN ACTION GRID (VIP 4 TILES) */}
      <h2 className="text-xl font-black text-white mt-8 mb-4 flex items-center gap-2">
        <span>⚡ Quick Study Hub</span>
      </h2>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <VipTile
          href="/subject"
          badge="50 MCQs / Topic"
          badgeColor="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          icon="📚"
          title="All Subjects & Topics"
          desc="अध्यायवार थ्योरी और 50 अभ्यास प्रश्नों के पूरे सेट हल करें।"
          btnText="विषय चुनें ➔"
        />

        <VipTile
          href="/quiz"
          badge="100+ PYQs Bank"
          badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
          icon="🎯"
          title="Previous Year Questions (PYQs)"
          desc="विगत वर्षों की परीक्षाओं में पूछे गए असली प्रश्नों का लाइव टेस्ट।"
          btnText="PYQs हल करें ➔"
        />

        <VipTile
          href="/ai-tutor"
          badge="24/7 AI Guru"
          badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
          icon="🤖"
          title="AI Super Doubt Solver"
          desc="फ़ोटो खींचें या सवाल लिखें — 1 सेकंड में सटीक हल और व्याख्या पाएँ।"
          btnText="डाउट पूछें ➔"
        />

        <VipTile
          href="/subject"
          badge="Revision Ready"
          badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
          icon="📝"
          title="Smart Notes & Summary"
          desc="एग्जाम से पहले क्विक रिवीजन के लिए वन-लाइनर बुलेट नोट्स।"
          btnText="नोट्स पढ़ें ➔"
        />

        <VipTile
          href="/student"
          badge="Saved"
          badgeColor="bg-pink-500/20 text-pink-300 border-pink-500/30"
          icon="🔖"
          title="Bookmarks & Saved Items"
          desc="कठिन सवाल और महत्वपूर्ण टॉपिक जिन्हें आपने बाद के लिए सेव किया है।"
          btnText="बुकमार्क्स देखें ➔"
        />

        <VipTile
          href="/admin"
          badge="System"
          badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
          icon="⚙️"
          title="Admin Control Panel"
          desc="नए सवाल, विषय, चैप्टर और PYQs का डेटा बल्क में अपलोड और मैनेज करें।"
          btnText="कंट्रोल पैनल ➔"
        />
      </section>

    </main>
  );
}

function VipTile({ href, badge, badgeColor, icon, title, desc, btnText }) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-full rounded-2xl bg-slate-900/70 border border-slate-800/90 group-hover:border-slate-600/80 p-6 backdrop-blur-xl transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-indigo-500/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-3xl p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 group-hover:scale-105 transition-transform">
              {icon}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
              {badge}
            </span>
          </div>

          <h3 className="text-lg font-black text-white mt-5 group-hover:text-cyan-400 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {desc}
          </p>
        </div>

        <div className="text-xs font-bold text-cyan-400 mt-6 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          {btnText}
        </div>
      </div>
    </Link>
  );
}