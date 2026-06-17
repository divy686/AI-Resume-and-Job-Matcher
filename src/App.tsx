
import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Sparkles, TrendingUp, Copy, Check } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [clLoading, setClLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState('');
  const [prepLoading, setPrepLoading] = useState(false);

  // 1. Core Resume Analysis Handler
  const handleUpload = async () => {
    if (!file || !jd) return alert("Please upload resume and enter JD");
    setLoading(true);
    setResult(null);
    setCoverLetter('');
    setInterviewPrep('');
    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("job_description", jd);
    try {
      const response = await axios.post("http://localhost:8000/analyze", formData);
      setResult(response.data.data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  // 2. Cover Letter Generation Handler
  const handleGenerateCoverLetter = async () => {
    if (!file || !jd) return;
    setClLoading(true);
    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("job_description", jd);
    try {
      const response = await axios.post("http://localhost:8000/generate-cover-letter", formData);
      setCoverLetter(response.data.cover_letter);
    } catch (error) {
      alert("Failed to generate cover letter.");
    } finally {
      setClLoading(false);
    }
  };

  // 3. Interview Prep Room Handler
  const handleGenerateInterviewPrep = async () => {
    if (!jd) return;
    setPrepLoading(true);
    const formData = new FormData();
    formData.append("job_description", jd);
    try {
      const response = await axios.post("http://localhost:8000/generate-interview-prep", formData);
      setInterviewPrep(response.data.interview_prep);
    } catch (error) {
      alert("Failed to generate interview questions.");
    } finally {
      setPrepLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = result ? [
    { name: 'Matched Skills', value: result.found_skills?.length || 1, color: '#10b981' },
    { name: 'Missing Skills', value: result.missing_skills?.length || 1, color: '#ef4444' }
  ] : [];
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-4 animate-pulse">
            <Sparkles size={16} /> Advanced AI Suite
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AI Resume and Job Matcher 
          </h1>
          <p className="text-slate-400 mt-3 text-lg max-w-xl mx-auto">
            Deep contextual job matching powered by Semantic Search & Realtime Recharts Matrix.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Input Side (5 Columns) */}
          <div className="lg:col-span-5 space-y-6 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-2xl">
            <div>
              <label className="block mb-2 font-semibold text-sm tracking-wide uppercase text-slate-400">Target Job Description</label>
              <textarea 
                className="w-full h-48 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm transition-all text-slate-100"
                placeholder="Paste requirements, tech stack, and core responsibilities here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>

            <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-8 text-center bg-slate-950/40 cursor-pointer transition-all group">
              <input 
                type="file" accept=".pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer block">
                <Upload className="mx-auto mb-3 text-slate-500 group-hover:text-blue-400 transition-colors" size={36} />
                <p className="font-medium text-slate-300">{file ? file.name : "Drop your Resume here or Browse"}</p>
                <p className="text-xs text-slate-500 mt-1">Supports standard PDF formats</p>
              </label>
            </div>

            <button 
              onClick={handleUpload} disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing Dynamics...
                </>
              ) : "Execute Deep Match"}
            </button>
          </div>
          {/* Right Output Dashboard (7 Columns) */}
          <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 min-h-[500px] shadow-2xl flex flex-col justify-between">
            {!result ? (
              <div className="my-auto text-center py-20 text-slate-600">
                <FileText size={72} className="mx-auto mb-4 stroke-[1.2] opacity-40" />
                <p className="text-lg font-medium">Awaiting Matrix Input</p>
                <p className="text-sm mt-1 max-w-xs mx-auto">Upload artifacts and execute matching to stream intelligence dashboards.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Charts Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/60">
                  <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left">
                    <span className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <TrendingUp size={16} /> ATS Algorithm Score
                    </span>
                    <h2 className="text-5xl font-black text-white">{result.match_percentage}%</h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      {result.experience_feedback}
                    </p>
                  </div>
                  <div className="h-36 w-full flex justify-center items-center">
  <PieChart width={140} height={140}>
    <Pie data={chartData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
      {chartData.map((entry: any, index: number) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
  </PieChart>
</div>

                </div>

                {/* Badges Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <CheckCircle2 size={16} /> Identified Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.found_skills?.map((skill: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{skill}</span>
                      )) || <span className="text-xs text-slate-500">No tools cataloged</span>}
                    </div>
                  </div>

                  <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <XCircle size={16} /> Missing Credentials
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills?.map((skill: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">{skill}</span>
                      )) || <span className="text-xs text-slate-500">Zero delta gaps detected</span>}
                    </div>
                  </div>
                </div>

                {/* Optimization Roadmap */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase">Strategic Optimization Roadmap</h3>
                  <ul className="space-y-2">
                    {result.suggestions?.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/30">
                        <span className="text-blue-500 font-bold">0{i+1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cover Letter Panel */}
                <div className="border-t border-slate-800 pt-6">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles size={18} className="text-purple-400" /> Tailored Cover Letter
                    </h3>
                    {!coverLetter && (
                      <button
                        onClick={handleGenerateCoverLetter} disabled={clLoading}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                      >
                        {clLoading && <Loader2 className="animate-spin" size={14} />}
                        {clLoading ? "Drafting..." : "Generate Document"}
                      </button>
                    )}
                  </div>
                  {coverLetter && (
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm text-slate-300 whitespace-pre-line relative animate-in fade-in duration-300 leading-relaxed">
                      <button 
                        onClick={handleCopy}
                        className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-lg transition-colors border border-slate-700 shadow-sm"
                      >
                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                      <div className="pr-8">{coverLetter}</div>
                    </div>
                  )}
                </div>

                {/* Mock Interview Prep Room */}
                <div className="border-t border-slate-800 pt-6">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles size={18} className="text-amber-400" /> AI Mock Interview Prep Room
                    </h3>
                    {!interviewPrep && (
                      <button
                        onClick={handleGenerateInterviewPrep} disabled={prepLoading}
                        className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                      >
                        {prepLoading && <Loader2 className="animate-spin" size={14} />}
                        {prepLoading ? "Simulating Interview..." : "Generate 5 Hardest Questions"}
                      </button>
                    )}
                  </div>
                  {interviewPrep && (
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm text-slate-300 whitespace-pre-line animate-in fade-in duration-300 leading-relaxed max-h-[400px] overflow-y-auto border-dashed">
                      {interviewPrep}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
