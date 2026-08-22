"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("कृपया अपना नाम दर्ज करें।");
      setLoading(false);
      return;
    }

    if (!cleanEmail) {
      setError("कृपया अपना email दर्ज करें।");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password कम से कम 8 characters का होना चाहिए।");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (!data?.user) {
        setError("Account create नहीं हो पाया। कृपया फिर कोशिश करें।");
        return;
      }

      setMessage(
        "Account successfully created. अब Login करें।"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      console.error("Signup error:", err);

      setError(
        "Account बनाते समय समस्या हुई। कृपया फिर कोशिश करें।"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="glass premium-card p-8 w-full max-w-md">

        <h1 className="text-3xl font-black text-gradient mb-2">
          Create Account
        </h1>

        <p className="text-slate-400 mb-6">
          Start your learning journey
        </p>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSignup}
          className="space-y-4"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            autoComplete="name"
            disabled={loading}
            className="w-full p-4 rounded-xl bg-white/10 outline-none text-white"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            disabled={loading}
            className="w-full p-4 rounded-xl bg-white/10 outline-none text-white"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            disabled={loading}
            className="w-full p-4 rounded-xl bg-white/10 outline-none text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Already have account?

          <Link
            href="/login"
            className="text-yellow-400 ml-2"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}