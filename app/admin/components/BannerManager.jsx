"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Bell, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState("");
  const [badgeText, setBadgeText] = useState("न्यू अपडेट");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const supabase = createClient();

  const loadBanners = async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBanners(data);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setMsg("");

    const { error } = await supabase.from("banners").insert({
      title: title.trim(),
      badge_text: badgeText.trim() || "अपडेट",
      link: link.trim() || null,
      is_active: true
    });

    if (!error) {
      setMsg("लाइव बैनर होमपेज पर सक्रिय हो गया!");
      setTitle("");
      setLink("");
      loadBanners();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (!error) loadBanners();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
      <div className="flex items-center gap-2.5 text-white font-bold text-base border-b border-slate-800 pb-3">
        <Bell className="w-5 h-5 text-amber-400" />
        <span>होमपेज लाइव बैनर व नोटिस कंट्रोलर</span>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleAddBanner} className="space-y-4 text-xs">
        <div>
          <label className="text-slate-300 block mb-1.5 font-semibold">बैनर नोटिस टेक्स्ट (शीर्षक):</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="उदा. REET Mains 2026 एडमिट कार्ड जारी! यहाँ से टेस्ट दें"
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-300 block mb-1.5 font-semibold">टैग / बैज (Badge):</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="उदा. न्यू अपडेट / जरूरी"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1.5 font-semibold">क्लिक लिंक (वैकल्पिक):</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="उदा. /quiz या /notes"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? "अपडेट हो रहा है..." : "होमपेज पर बैनर लाइव करें"}</span>
        </button>
      </form>

      {/* Active Banners List */}
      <div className="space-y-2.5 pt-4 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-400">वर्तमान सक्रिय बैनर्स ({banners.length}):</h4>
        {banners.length === 0 ? (
          <p className="text-xs text-slate-500">कोई सक्रिय बैनर नहीं है।</p>
        ) : (
          banners.map((b) => (
            <div key={b.id} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md mr-2">{b.badge_text}</span>
                <span className="text-white font-medium">{b.title}</span>
                {b.link && <div className="text-[10px] text-slate-500">लिंक: {b.link}</div>}
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition flex-shrink-0"
                title="हटाएँ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
