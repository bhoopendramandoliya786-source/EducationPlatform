"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");



  async function handleLogin(e) {

    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });


    if(error){

      setMessage(error.message);
      setLoading(false);
      return;

    }


    console.log("LOGIN USER:", data.user);


    const {
      data: sessionData
    } = await supabase.auth.getSession();


    console.log(
      "AFTER LOGIN SESSION:",
      sessionData.session
    );


    if(!sessionData.session){

      setMessage("Session not created. Try again.");
      setLoading(false);
      return;

    }


    setMessage("Login successful");


    router.refresh();

    router.push("/student");


  }



  return (

    <main
      className="
      min-h-screen
      container
      flex
      items-center
      justify-center
      py-10
      "
    >

      <div
        className="
        glass
        premium-card
        p-8
        w-full
        max-w-md
        "
      >

        <h1
          className="
          text-3xl
          font-black
          text-gradient
          mb-2
          "
        >
          Welcome Back
        </h1>


        <p className="text-slate-400 mb-6">
          Continue your learning journey
        </p>



        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="Email"
            className="
            w-full
            p-4
            rounded-xl
            bg-white/10
            outline-none
            text-white
            "
          />


          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="Password"
            className="
            w-full
            p-4
            rounded-xl
            bg-white/10
            outline-none
            text-white
            "
          />


          <button
            disabled={loading}
            className="
            btn-gold
            w-full
            "
          >

            {
              loading
              ?
              "Logging in..."
              :
              "Login"
            }

          </button>


        </form>



        {
          message &&
          <p className="
          mt-5
          text-center
          text-slate-300
          ">
            {message}
          </p>
        }



        <p className="
        mt-6
        text-center
        text-slate-400
        ">

          Don't have account?

          <Link
            href="/signup"
            className="
            text-yellow-400
            ml-2
            "
          >
            Create Account
          </Link>

        </p>


      </div>

    </main>

  );

}