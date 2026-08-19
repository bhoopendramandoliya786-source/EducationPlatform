import Link from "next/link";
import Navbar from "../components/Navbar";
import { createClient } from "../../lib/supabase/server";

export const revalidate = 600;

export default async function SubjectPage() {

  const supabase = await createClient();

  const {
    data: subjects,
    error
  } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      description,
      icon
    `)
    .order("name", {
      ascending: true
    });


  return (

    <main className="app-shell">

      <Navbar />

      <div className="container">

        <section className="
          glass
          premium-card
          mt-8
          p-8
        ">

          <h1 className="
            text-4xl
            font-black
          ">
            📚 Subjects
          </h1>

          <p className="text-slate-400 mt-3">
            अपना subject चुनें और पढ़ाई शुरू करें।
          </p>

        </section>


        <section className="mt-10">

          {
            error ?

            <div className="premium-card p-6 text-red-400">
              Subjects load नहीं हो पाए।
            </div>

            :

            subjects?.length ?

            <div className="
              grid
              sm:grid-cols-2
              lg:grid-cols-3
              gap-6
            ">

              {
                subjects.map((subject)=>(

                  <Link
                    key={subject.id}
                    href={`/subject/${subject.id}`}
                  >

                    <div className="
                      premium-card
                      p-6
                      h-full
                    ">

                      <div className="text-4xl">
                        {subject.icon || "📚"}
                      </div>


                      <h2 className="
                        text-xl
                        font-bold
                        mt-4
                      ">
                        {subject.name}
                      </h2>


                      <p className="
                        text-slate-400
                        mt-3
                      ">
                        {
                          subject.description ||
                          "इस subject को पढ़ें"
                        }
                      </p>


                      <div className="
                        text-yellow-400
                        font-bold
                        mt-5
                      ">
                        Open Subject →
                      </div>


                    </div>

                  </Link>

                ))
              }

            </div>

            :

            <div className="
              premium-card
              p-6
              text-slate-400
            ">
              अभी कोई subject उपलब्ध नहीं है।
            </div>

          }

        </section>


      </div>

    </main>

  );
}