import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

export const revalidate = 0;


export default async function StudentPage() {

  const supabase = await createClient();

const { data } = await supabase.auth.getUser();

const user = data.user;

if(!user){
  redirect("/login");
}


const {
  data: profile,
  error: profileError
} = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

if(profileError){
  console.log("PROFILE ERROR:", profileError);
}

const { count: completedTopics } = await supabase
  .from("progress")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .eq("completed", true);


const { count: quizAttempts } = await supabase
  .from("attempts")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id);


const { data: lastStudy } = await supabase
  .from("progress")
  .select(`
    topic_id,
    topics(
      name
    )
  `)
  .eq("user_id", user.id)
  .order("last_studied_at", {
    ascending:false
  })
  .limit(1)
  .maybeSingle();


  return (

<main
className="
min-h-screen
container
py-10
"
>


<div
className="
glass
premium-card
p-8
"
>


<div
className="
flex
flex-col
md:flex-row
md:items-center
md:justify-between
gap-5
"
>


<div>

<p
className="
text-sky-400
font-bold
text-sm
"
>
STUDENT DASHBOARD
</p>


<h1
className="
text-3xl
md:text-4xl
font-black
text-gradient
mt-2
"
>
Welcome {profile?.full_name || "Student"} 👋
</h1>


<p
className="
text-slate-400
mt-2
"
>
{profile?.email || user.email}
</p>


</div>



<LogoutButton />



</div>


</div>

<section className="grid md:grid-cols-3 gap-5 mt-8">

<div className="glass premium-card p-6">
<h3 className="text-slate-400">
Completed Topics
</h3>

<p className="text-4xl font-black mt-3">
{completedTopics || 0}
</p>
</div>


<div className="glass premium-card p-6">
<h3 className="text-slate-400">
Quiz Attempts
</h3>

<p className="text-4xl font-black mt-3">
{quizAttempts || 0}
</p>
</div>


<div className="glass premium-card p-6">
<h3 className="text-slate-400">
Last Studied
</h3>

<p className="text-xl font-bold mt-3">
{lastStudy?.topics?.name || "Start Learning"}
</p>
</div>

</section>



<section
className="
grid
md:grid-cols-3
gap-5
mt-8
"
>


<Card
href="/subject"
icon="📚"
title="Continue Learning"
text="Resume your subjects and topics"
/>


<Card
href="/quiz"
icon="📝"
title="Quiz"
text="Practice and improve your score"
/>


<Card
href="/student"
icon="🔖"
title="Bookmarks"
text="Save important content"
/>


<Card
href="/practice"
icon="⚡"
title="Practice"
text="Solve MCQ questions"
/>


<Card
href="/ai"
icon="🤖"
title="AI Tutor"
text="Ask your doubts"
/>


<Card
href="/student"
icon="📈"
title="Progress"
text="Track your preparation"
/>


</section>




<section
className="
glass
premium-card
p-7
mt-10
"
>

<h2
className="
text-2xl
font-black
"
>
🎯 Ready to Study?
</h2>


<p
className="
text-slate-400
mt-3
"
>
अपनी तैयारी जारी रखें और रोज़ progress करें।
</p>



<div
className="
flex
gap-4
flex-wrap
mt-6
"
>

<Link
href="/subject"
className="btn-gold"
>
Start Study
</Link>


<Link
href="/quiz"
className="btn-primary"
>
Take Quiz
</Link>


</div>

</section>



</main>

  );

}




function Card({
href,
icon,
title,
text
}){

return (

<Link
href={href}
className="block"
>

<div
className="
glass
premium-card
p-6
h-full
"
>

<div className="text-4xl">
{icon}
</div>


<h2 className="text-xl font-bold mt-4">
{title}
</h2>


<p className="text-slate-400 mt-2">
{text}
</p>


<div className="text-sky-400 font-bold mt-5">
Open →
</div>


</div>

</Link>

);

}