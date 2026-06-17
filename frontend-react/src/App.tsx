import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Sparkles, TrendingUp, Copy, Check, LogIn, UserPlus, LogOut } from 'lucide-react';
import { jsPDF } from 'jspdf';


export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem('username'));
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');     
  const [authLoading, setAuthLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [clLoading, setClLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState('');
  const [prepLoading, setPrepLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) return alert("Please fill all fields");
    setAuthLoading(true);
    const formData = new FormData();
    formData.append("username", usernameInput);
    formData.append("password", passwordInput);
    try {
      const url = authMode === 'login' ? 'http://localhost:8000/auth/login' : 'http://localhost:8000/auth/signup';
      const response = await axios.post(url, formData);
      if (authMode === 'login') {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('username', response.data.username);
        setUser(response.data.username);
      } else {
        alert("Signup successful! Switching to login.");
        setAuthMode('login');
      }
      setPasswordInput('');
    } catch (err: any) { alert(err.response?.data?.detail || "Auth pipeline error"); } finally { setAuthLoading(false); }
  };

  const handleUpload = async () => {
    if (!file || !jd) return alert("Upload resume and enter JD");
    setLoading(true); setResult(null); setCoverLetter(''); setInterviewPrep('');
    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("job_description", jd);
    formData.append("username", user || "anonymous");
    try {
      const response = await axios.post("http://localhost:8000/analyze", formData);
      setResult(response.data.data);
    } catch (e) { alert("Backend offline. Make sure main.py is active!"); } finally { setLoading(false); }
  };

  const handleGenerateCoverLetter = async () => {
    if (!file || !jd) return;
    setClLoading(true);
    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("job_description", jd);
    try {
      const response = await axios.post("http://localhost:8000/generate-cover-letter", formData);
      setCoverLetter(response.data.cover_letter);
    } catch (e) { alert("Error generating cover letter."); } finally { setClLoading(false); }
  };

  const handleGenerateInterviewPrep = async () => {
    if (!jd) return;
    setPrepLoading(true);
    const formData = new FormData();
    formData.append("job_description", jd);
    try {
      const response = await axios.post("http://localhost:8000/generate-interview-prep", formData);
      setInterviewPrep(response.data.interview_prep);
    } catch (e) { alert("Error generating interview prep."); } finally { setPrepLoading(false); }
  };
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
        <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-xl font-black text-center">{authMode === 'login' ? 'Access Portal' : 'Create Account'}</h2>
          <form onSubmit={handleAuth} className="space-y-3">
            <input type="text" placeholder="Username" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
            <input type="password" placeholder="Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
            <button type="submit" className="w-full py-3 bg-indigo-600 font-bold text-xs uppercase rounded-xl">{authLoading ? 'Processing...' : authMode === 'login' ? 'Log In' : 'Sign Up'}</button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full text-xs text-indigo-400 hover:underline">{authMode === 'login' ? "New identity? Create account" : 'Existing user? Log in'}</button>
        </div>
      </main>
    );
  }

    const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Design Styles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("TALENTPULSE AI - EVALUATION REPORT", 14, 20);
    
    doc.setDrawColor(150);
    doc.line(14, 25, 196, 25);
    
    doc.setFontSize(12);
    doc.text(`User Identity: ${user}`, 14, 35);
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 14, 42);
    
    doc.setFontSize(16);
    doc.text(`COMPATIBILITY INDEX SCORE: ${result.match_percentage}%`, 14, 55);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const feedbackLines = doc.splitTextToSize(`Feedback: ${result.experience_feedback}`, 180);
    doc.text(feedbackLines, 14, 65);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("IDENTIFIED ASSETS:", 14, 95);
    doc.setFont("helvetica", "normal");
    doc.text(result.found_skills?.join(", ") || "None", 14, 102);
    
    doc.setFont("helvetica", "bold");
    doc.text("STRUCTURAL GAPS:", 14, 115);
    doc.setFont("helvetica", "normal");
    doc.text(result.missing_skills?.join(", ") || "None", 14, 122);
    
    doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC OPTIMIZATION ROADMAP:", 14, 135);
    doc.setFont("helvetica", "normal");
    let currentY = 142;
    result.suggestions?.forEach((item: string, idx: number) => {
      doc.text(`0${idx + 1}. ${item}`, 14, currentY);
      currentY += 8;
    });
    
    // Save Document payload
    doc.save(`AI_Evaluation_Report_${user}.pdf`);
  };


  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center py-4 px-6 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-md shadow-xl">
          <h1 className="text-sm font-bold text-white uppercase tracking-wider">AI Resume & Job Matcher</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono bg-black/40 border border-slate-800 px-2.5 py-1 rounded">node://{user}</span>
            <button onClick={() => { localStorage.clear(); setUser(null); setResult(null); }} className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 text-xs">Logout</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800 shadow-xl">
            <textarea className="w-full h-40 bg-black/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono resize-none outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Paste target requirements matrix..." value={jd} onChange={(e) => setJd(e.target.value)} />
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center bg-black/10 cursor-pointer">
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="file-id" />
              <label htmlFor="file-id" className="cursor-pointer block text-xs text-slate-300">{file ? file.name : "Upload Candidate Resume PDF"}</label>
            </div>
            <button onClick={handleUpload} disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" size={14} /> : "Execute Evaluation"}</button>
            
{result && (
  <button 
    onClick={handleDownloadPDF}
    className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
  >
    Download Analysis Report as PDF 📄
  </button>
)}
          </div>

          {/* Outputs Section */}
          <div className="lg:col-span-7 bg-slate-900/20 backdrop-blur-md p-5 rounded-xl border border-slate-800/40 min-h-[400px] flex flex-col justify-between shadow-xl">
            {!result ? (
              <div className="my-auto text-center text-slate-600 space-y-1">
                <FileText size={48} className="mx-auto text-indigo-400 opacity-30" />
                <p className="text-xs">Secure workspace verified. Upload criteria vectors.</p>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="bg-black/30 p-4 rounded-xl border border-slate-800 flex justify-between items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Compatibility Index</span>
                    <h2 className="text-3xl font-black text-white">{result.match_percentage}%</h2>
                  </div>
                  <p className="text-slate-400 text-xs font-light max-w-xs text-right leading-relaxed">{result.experience_feedback}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/20">
                    <h3 className="text-xs font-bold text-emerald-400 mb-1">✓ Assets</h3>
                    <div className="flex flex-wrap gap-1">{result.found_skills?.map((s: string, i: number) => <span key={i} className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400">{s}</span>)}</div>
                  </div>
                  <div className="bg-rose-950/10 p-3 rounded-xl border border-rose-500/20">
                    <h3 className="text-xs font-bold text-rose-400 mb-1">✗ Gaps</h3>
                    <div className="flex flex-wrap gap-1">{result.missing_skills?.map((s: string, i: number) => <span key={i} className="px-2 py-0.5 text-[10px] rounded bg-rose-500/10 text-rose-400">{s}</span>)}</div>
                  </div>
                </div>

                <div className="space-y-1 bg-black/20 p-3 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400">Optimization Roadmap</h3>
                  {result.suggestions?.map((item: string, i: number) => (
                    <p key={i} className="text-xs text-slate-300 flex gap-2 font-light"><span className="text-indigo-400 font-bold">0{i+1}</span>{item}</p>
                  ))}
                </div>

                {/* Letter section */}
                <div className="border-t border-slate-800 pt-3 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400">Letter Engine</h3>
                    {!coverLetter && <button onClick={handleGenerateCoverLetter} disabled={clLoading} className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">{clLoading ? "Compiling..." : "Generate Letter"}</button>}
                  </div>
                  {coverLetter && (
                    <div className="bg-black/40 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 whitespace-pre-line relative font-mono max-h-[160px] overflow-y-auto">
                      <button onClick={() => { navigator.clipboard.writeText(coverLetter); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-2 right-2 p-1 bg-slate-900 border border-slate-800 text-slate-400 rounded text-[10px]">{copied ? <Check size={10} /> : <Copy size={10} />}</button>
                      <div className="pr-6">{coverLetter}</div>
                    </div>
                  )}
                </div>

                {/* Simulation section */}
                <div className="border-t border-slate-800 pt-3 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400">Simulation Lab</h3>
                    {!interviewPrep && <button onClick={handleGenerateInterviewPrep} disabled={prepLoading} className="px-3 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-lg">{prepLoading ? "Simulating..." : "Launch Evaluation"}</button>}
                  </div>
                  {interviewPrep && <div className="bg-black/30 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 whitespace-pre-line max-h-[160px] overflow-y-auto font-mono">{interviewPrep}</div>}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
