"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";


export default function SignupPage() {


  const router = useRouter();


  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");




  async function handleSignup(e){

    e.preventDefault();

    setLoading(true);
    setMessage("");



    const {
      data,
      error
    } = await supabase.auth.signUp({

      email,
      password,

      options:{
        data:{
          full_name:name
        }
      }

    });



    if(data.user){

  await supabase
  .from("profiles")
  .insert({
    id: data.user.id,
    full_name: name,
    email: email
  });


  setMessage(
    "Account created. Please login."
  );

    


      setTimeout(()=>{

        router.push("/login");

      },1500);


    }


    setLoading(false);

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
Create Account
</h1>


<p
className="
text-slate-400
mb-6
"
>
Start your learning journey
</p>




<form
onSubmit={handleSignup}
className="
space-y-4
"
>


<input

value={name}

onChange={(e)=>setName(e.target.value)}

placeholder="Full Name"

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
"Creating..."
:
"Create Account"
}

</button>



</form>



{
message &&

<p
className="
mt-5
text-center
text-slate-300
"
>
{message}
</p>

}



<p
className="
mt-6
text-center
text-slate-400
"
>

Already have account?

<Link
href="/login"
className="
text-yellow-400
ml-2
"
>
Login
</Link>


</p>



</div>


</main>

);


}