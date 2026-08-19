"use client";

import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";


export default function LogoutButton(){

  const router = useRouter();


  async function logout(){

    await supabase.auth.signOut();

    router.push("/login");

    router.refresh();

  }


  return (

    <button

    onClick={logout}

    className="
    btn-gold
    "
    
    >
      Logout
    </button>

  );

}