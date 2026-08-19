import Link from "next/link";
import { supabase } from "../../lib/supabase";


export const revalidate = 0;


export default async function SearchPage({ searchParams }) {


  const params = await searchParams;

  const query = params?.q || "";

  const value = query.trim();



  let subjects = [];
  let chapters = [];
  let topics = [];



  if(value){


    const searchText = `%${value}%`;



    const subjectsData = await supabase
      .from("subjects")
      .select("id,name,description,icon")
      .eq("is_active",true)
      .ilike("name",searchText)
      .limit(10);



    const chaptersData = await supabase
      .from("chapters")
      .select("id,name,description")
      .eq("is_active",true)
      .ilike("name",searchText)
      .limit(10);



    const topicsData = await supabase
      .from("topics")
      .select("id,name")
      .eq("is_active",true)
      .ilike("name",searchText)
      .limit(10);



    subjects = subjectsData.data || [];
    chapters = chaptersData.data || [];
    topics = topicsData.data || [];


  }





  const results = [

    ...subjects.map(item=>({
      type:"Subject",
      icon:"📚",
      title:item.name,
      desc:item.description,
      link:`/subject/${item.id}`
    })),


    ...chapters.map(item=>({
      type:"Chapter",
      icon:"📖",
      title:item.name,
      desc:item.description,
      link:`/chapter/${item.id}`
    })),


    ...topics.map(item=>({
      type:"Topic",
      icon:"🧩",
      title:item.name,
      desc:"Notes • MCQ • PYQ • Quiz",
      link:`/topic/${item.id}`
    }))

  ];






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


<h1
className="
text-3xl
font-black
text-gradient
"
>

Search Result

</h1>


<p
className="
text-slate-400
mt-2
"
>

Search:
{value || "कुछ लिखें"}

</p>


</div>





<div
className="
mt-8
grid
gap-5
md:grid-cols-2
"
>



{
results.length > 0 ?


results.map((item,index)=>(


<Link
key={index}
href={item.link}
className="
premium-card
p-6
hover:scale-[1.02]
transition
"
>


<div
className="
flex
gap-4
items-center
"
>


<div
className="
text-4xl
"
>
{item.icon}
</div>


<div>

<div
className="
text-xs
text-yellow-400
font-bold
"
>
{item.type}
</div>


<h2
className="
text-xl
font-bold
mt-1
"
>
{item.title}
</h2>


<p
className="
text-slate-400
mt-2
"
>
{item.desc}
</p>


</div>


</div>


</Link>


))


:

<div
className="
glass
premium-card
p-10
text-center
text-slate-400
"
>

कोई result नहीं मिला

</div>


}


</div>




</main>


);


}