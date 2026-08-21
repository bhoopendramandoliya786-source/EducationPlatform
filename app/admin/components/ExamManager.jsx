'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { Award, Plus, Trash2, BookOpen, RefreshCw, FileText, Download } from 'lucide-react';

export default function ExamManager() {
  const supabase = createClient();

  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examSubjects, setExamSubjects] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State for New Exam
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Rajasthan State');
  const [description, setDescription] = useState('');
  const [syllabusPdfUrl, setSyllabusPdfUrl] = useState('');
  const [syllabusText, setSyllabusText] = useState('');

  async function loadData() {
    try {
      setLoading(true);

      const [{ data: examsData }, { data: subjectsData }, { data: mapData }] = await Promise.all([
        supabase.from('exams').select('*').order('sort_order', { ascending: true }),
        supabase.from('subjects').select('id, name').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('exam_subjects').select('exam_id, subject_id')
      ]);

      setExams(examsData || []);
      setSubjects(subjectsData || []);

      const mapping = {};
      (mapData || []).forEach(row => {
        if (!mapping[row.exam_id]) mapping[row.exam_id] = [];
        mapping[row.exam_id].push(row.subject_id);
      });
      setExamSubjects(mapping);
    } catch (err) {
      console.error('Error loading exams:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddExam(e) {
    e.preventDefault();
    if (!name || !slug) return alert('Name और Slug अनिवार्य हैं!');

    try {
      setSaving(true);
      const { data, error } = await supabase.from('exams').insert([
        { 
          name, 
          slug: slug.toLowerCase().trim(), 
          category, 
          description, 
          syllabus_pdf_url: syllabusPdfUrl.trim() || null,
          syllabus_text: syllabusText.trim() || null,
          sort_order: exams.length + 1 
        }
      ]).select().single();

      if (error) throw error;

      if (data && subjects.length > 0) {
        const initialLinks = subjects.map(s => ({ exam_id: data.id, subject_id: s.id }));
        await supabase.from('exam_subjects').insert(initialLinks);
      }

      setName('');
      setSlug('');
      setDescription('');
      setSyllabusPdfUrl('');
      setSyllabusText('');
      loadData();
    } catch (err) {
      alert('Exam Add Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleSubjectMapping(examId, subjectId) {
    const currentList = examSubjects[examId] || [];
    const isMapped = currentList.includes(subjectId);

    try {
      if (isMapped) {
        await supabase.from('exam_subjects').delete().eq('exam_id', examId).eq('subject_id', subjectId);
        setExamSubjects(prev => ({
          ...prev,
          [examId]: prev[examId].filter(id => id !== subjectId)
        }));
      } else {
        await supabase.from('exam_subjects').insert([{ exam_id: examId, subject_id: subjectId }]);
        setExamSubjects(prev => ({
          ...prev,
          [examId]: [...(prev[examId] || []), subjectId]
        }));
      }
    } catch (err) {
      alert('Error updating subject: ' + err.message);
    }
  }

  async function handleDeleteExam(examId) {
    if (!confirm('क्या आप इस परीक्षा को हटाना चाहते हैं?')) return;
    try {
      await supabase.from('exams').delete().eq('id', examId);
      loadData();
    } catch (err) {
      alert('Delete Error: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
        Exam Manager लोड हो रहा है...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Add Exam Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">नई परीक्षा जोड़ें (Add Target Exam)</h2>
        </div>

        <form onSubmit={handleAddExam} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold mb-1 block">परीक्षा का नाम (Exam Name)</label>
            <input
              type="text"
              placeholder="e.g. RAS Pre 2026, CET Graduation"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">URL Slug</label>
            <input
              type="text"
              placeholder="e.g. ras-pre, cet-12th"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">बोर्ड / श्रेणी (Board / Category)</label>
            <input
              type="text"
              placeholder="e.g. RPSC, RSMSSB, Police"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Official Syllabus PDF Link (URL)</label>
            <input
              type="url"
              placeholder="https://example.com/syllabus.pdf"
              value={syllabusPdfUrl}
              onChange={(e) => setSyllabusPdfUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 font-semibold mb-1 block">विवरण (Description)</label>
            <input
              type="text"
              placeholder="e.g. राजस्थान प्रशासनिक सेवा प्रारंभिक परीक्षा संपूर्ण पाठ्यक्रम"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 font-semibold mb-1 block">विस्तृत सिलेबस विवरण (Syllabus Breakdown Text)</label>
            <textarea
              rows={4}
              placeholder="परीक्षा पैटर्न: 150 प्रश्न, 200 अंक, 3 घंटे...&#10;• इतिहास एवं कला-संस्कृति: 25 प्रश्न&#10;• भूगोल एवं पर्यावरण: 30 प्रश्न"
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? 'सेव हो रहा है...' : 'परीक्षा जोड़ें (Save Exam)'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Existing Exams List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          सक्रिय परीक्षाएं एवं उनके विषय ({exams.length})
        </h3>

        {exams.map(exam => {
          const mapped = examSubjects[exam.id] || [];

          return (
            <div key={exam.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-3 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {exam.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      /exam/{exam.slug}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{exam.name}</h4>
                  <p className="text-xs text-slate-400">{exam.description}</p>
                  
                  {exam.syllabus_pdf_url && (
                    <a
                      href={exam.syllabus_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline pt-0.5 font-semibold"
                    >
                      <Download className="w-3 h-3" />
                      PDF Syllabus Link Available
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                  title="परीक्षा हटाएं"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subject Mapping Checkboxes */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  इस परीक्षा में शामिल विषय चुनें:
                </span>

                <div className="flex flex-wrap gap-2 pt-1">
                  {subjects.map(sub => {
                    const isSelected = mapped.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubjectMapping(exam.id, sub.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                            : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                        <span>{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}