"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function NotesManager() {

  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);

  const [topicId, setTopicId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("study");

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchTopics();
    fetchNotes();
  }, []);


  async function fetchTopics(){

    const {data,error}=await supabase
      .from("topics")
      .select("id,name")
      .order("name");

    if(!error){
      setTopics(data || []);
    }

  }



  async function fetchNotes(){

    const {data,error}=await supabase
      .from("notes")
      .select(`
        *,
        topics(
          name
        )
      `)
      .order("created_at",{ascending:false});


    if(!error){
      setNotes(data || []);
    }

  }



  async function saveNote(e){

    e.preventDefault();


    if(!topicId || !title || !content){

      alert("Topic, title और content जरूरी है");
      return;

    }


    setLoading(true);


    const payload={

      topic_id:Number(topicId),

      title,

      content,

      note_type:noteType

    };



    let error;



    if(editId){

      const result=await supabase
        .from("notes")
        .update(payload)
        .eq("id",editId);

      error=result.error;


    }else{


      const result=await supabase
        .from("notes")
        .insert([payload]);

      error=result.error;

    }



    setLoading(false);



    if(error){

      alert(error.message);

    }else{


      setTitle("");
      setContent("");
      setEditId(null);

      fetchNotes();

    }


  }



  function editNote(note){

    setEditId(note.id);

    setTopicId(note.topic_id);

    setTitle(note.title);

    setContent(note.content);

    setNoteType(note.note_type);

  }




  async function deleteNote(id){


    if(!confirm("Note delete करना है?"))
      return;


    const {error}=await supabase
      .from("notes")
      .delete()
      .eq("id",id);



    if(error){

      alert(error.message);

    }else{

      fetchNotes();

    }

  }




  async function togglePublish(note){


    const {error}=await supabase
      .from("notes")
      .update({
        is_published:!note.is_published
      })
      .eq("id",note.id);



    if(!error){

      fetchNotes();

    }

  }




  return (

    <div
      style={{
        background:"#111827",
        color:"white",
        padding:"20px",
        borderRadius:"16px",
        marginTop:"20px"
      }}
    >

      <h2>
        📝 Notes Manager
      </h2>


      <form onSubmit={saveNote}>

        <select
          value={topicId}
          onChange={(e)=>setTopicId(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"10px"
          }}
        >

          <option value="">
            Select Topic
          </option>

          {topics.map(t=>(

            <option
              key={t.id}
              value={t.id}
            >
              {t.name}
            </option>

          ))}

        </select>


        <input
          placeholder="Note title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"10px"
          }}
        />


        <select
          value={noteType}
          onChange={(e)=>setNoteType(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"10px"
          }}
        >

          <option value="study">
            Study
          </option>

          <option value="short">
            Short Revision
          </option>

          <option value="revision">
            Revision
          </option>

        </select>


        <textarea
          rows="8"
          placeholder="Notes content"
          value={content}
          onChange={(e)=>setContent(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"10px"
          }}
        />


        <button
          disabled={loading}
          style={{
            background:"#10b981",
            padding:"10px 20px",
            border:"none",
            borderRadius:"8px",
            fontWeight:"bold"
          }}
        >
          {editId ? "Update Note" : "Save Note"}
        </button>

      </form>


      <div style={{marginTop:"20px"}}>

        {notes.map(note=>(

          <div
            key={note.id}
            style={{
              background:"#1e293b",
              padding:"12px",
              borderRadius:"8px",
              marginBottom:"10px"
            }}
          >

            <b>{note.title}</b>

            <p style={{fontSize:"12px"}}>
              {note.topics?.name}
            </p>


            <div>

              <button
                onClick={()=>editNote(note)}
                style={{
                  background:"#f59e0b",
                  marginRight:"5px",
                  border:"none",
                  padding:"6px"
                }}
              >
                Edit
              </button>


              <button
                onClick={()=>togglePublish(note)}
                style={{
                  background:"#3b82f6",
                  color:"white",
                  marginRight:"5px",
                  border:"none",
                  padding:"6px"
                }}
              >
                {note.is_published ? "Hide" : "Publish"}
              </button>


              <button
                onClick={()=>deleteNote(note.id)}
                style={{
                  background:"#ef4444",
                  color:"white",
                  border:"none",
                  padding:"6px"
                }}
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}