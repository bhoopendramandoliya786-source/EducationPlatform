'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
    >
      लॉगआउट
    </button>
  );
}
