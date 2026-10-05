import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import { 
  Sparkles, 
  Save, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Cpu, 
  FileText, 
  HelpCircle, 
  Flame,
  Atom,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export default function StudentDashboard({ onSelectAnalysis }) {
  // Form State
  const [ideaId, setIdeaId] = useState(null);
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');

  // UI state
  const [analyzing, setAnalyzing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Data lists
  const [ideas, setIdeas] = useState([]);

  // Fetch student ideas
  const fetchIdeas = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getIdeas();
      setIdeas(data.ideas || []);
    } catch (err) {
      setError(err.message || 'Failed to load your ideas.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  // Separate drafts and analyzed ideas
  const drafts = ideas.filter(i => i.status === 'draft');
  const analyzedIdeas = ideas.filter(i => i.status === 'analyzed' || i.overall_score !== null);

  // Handle Save Draft
  const handleSaveDraft = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setError('Please provide at least a project title to save a draft.');
      return;
    }

    setSavingDraft(true);
    try {
      const res = await api.saveDraft({
        id: ideaId,
        title,
        problem_statement: problemStatement,
        description,
        technologies
      });

      setIdeaId(res.idea.id);
      setSuccessMessage('Draft saved successfully!');
      fetchIdeas();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to save draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  // Handle Run Analysis
  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title.trim() || !problemStatement.trim() || !description.trim() || !technologies.trim()) {
      setError('All fields (Title, Problem Statement, Description, and Technologies) are required for analysis.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.analyzeIdea({
        id: ideaId,
        title,
        problem_statement: problemStatement,
        description,
        technologies
      });

      // Navigate to detailed analysis view
      onSelectAnalysis(res.idea.id, res.analysis);
    } catch (err) {
      setError(err.message || 'Similarity analysis failed.');
      setAnalyzing(false);
    }
  };

  // Load a draft into form
  const handleLoadDraft = (draft) => {
    setIdeaId(draft.id);
    setTitle(draft.title || '');
    setProblemStatement(draft.problem_statement || '');
    setDescription(draft.description || '');
    setTechnologies(draft.technologies || '');
    setError(null);
    setSuccessMessage(`Loaded draft: "${draft.title}"`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form
  const handleResetForm = () => {
    setIdeaId(null);
    setTitle('');
    setProblemStatement('');
    setDescription('');
    setTechnologies('');
    setError(null);
    setSuccessMessage(null);
  };

  // Delete an idea
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this idea?')) return;

    try {
      await api.deleteIdea(id);
      if (ideaId === id) handleResetForm();
      fetchIdeas();
    } catch (err) {
      setError(err.message || 'Failed to delete idea.');
    }
  };

  // Quick preset templates for rapid student testing
  const loadPresetTemplate = (type) => {
    if (type === 'wildfire') {
      setTitle('Autonomous Wildfire & Thermal Smoke Detection Drone');
      setProblemStatement('Forest fires spread rapidly before ground crews can spot them. Early aerial thermal detection is critical.');
      setDescription('An edge AI aerial drone system with Raspberry Pi and PyTorch computer vision to detect smoke plumes and coordinate alerts.');
      setTechnologies('Python, PyTorch, OpenCV, YOLOv8, LoRaWAN, Raspberry Pi');
    } else if (type === 'quantum') {
      setTitle('Quantum Entanglement Simulation for Secure Optical Communication');
      setProblemStatement('Classical encryption keys are vulnerable to prospective quantum supercomputers. Optical key distribution needs testing.');
      setDescription('Simulating single-photon polarization states and BB84 quantum protocols under simulated atmospheric turbulence.');
      setTechnologies('Python, Qiskit, NumPy, SciPy, Matplotlib');
    }
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Project Idea Workspace
          </h1>
          <p className="text-sm text-vault-textMuted mt-1">
            Submit your proposed project to check overlap with faculty-approved historical records and receive actionable guidance.
          </p>
        </div>

        {/* Preset demo ideas */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-vault-textMuted hidden md:inline">Quick Test Ideas:</span>
          <button
            type="button"
            onClick={() => loadPresetTemplate('wildfire')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vault-card border border-vault-border hover:border-vault-cyan/40 text-xs font-medium text-vault-cyan transition-all"
            title="Load an idea similar to existing drone project"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Wildfire Drone</span>
          </button>
          <button
            type="button"
            onClick={() => loadPresetTemplate('quantum')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vault-card border border-vault-border hover:border-vault-violet/40 text-xs font-medium text-vault-violetLight transition-all"
            title="Load a novel idea with zero repository overlap"
          >
            <Atom className="w-3.5 h-3.5 text-vault-violetLight" />
            <span>Quantum Sim</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Idea Form on Left, Drafts & History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Idea Submission Form (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-vault-border shadow-xl relative">
            
            {/* Form Top Banner */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-vault-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-vault-violet/20 border border-vault-violet/30 flex items-center justify-center text-vault-violetLight">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-heading">
                    {ideaId ? 'Edit Project Idea' : 'Compose New Project Idea'}
                  </h2>
                  <span className="text-xs text-vault-textMuted">
                    {ideaId ? 'Updating draft / existing idea' : 'Provide clear details for accurate TF-IDF analysis'}
                  </span>
                </div>
              </div>

              {ideaId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-vault-textMuted hover:text-white px-2.5 py-1 rounded-lg border border-vault-border"
                >
                  Clear / New Idea
                </button>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleRunAnalysis} className="space-y-5">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-2">
                  Project Title <span className="text-vault-cyan">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Decentralized Zero-Knowledge Medical Record Audit Trail"
                  className="w-full px-4 py-3 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm placeholder-vault-textMuted/40 focus:outline-none focus:border-vault-cyan focus:ring-1 focus:ring-vault-cyan transition-all"
                  required
                />
              </div>

              {/* Problem Statement */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-vault-textMuted">
                    Problem Statement <span className="text-vault-cyan">*</span>
                  </label>
                  <span className="text-[11px] text-vault-textMuted">
                    What specific friction or gap are you solving?
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Explain the real-world challenge, target users, and why existing solutions are insufficient..."
                  className="w-full px-4 py-3 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm placeholder-vault-textMuted/40 focus:outline-none focus:border-vault-cyan focus:ring-1 focus:ring-vault-cyan transition-all resize-none"
                  required
                />
              </div>

              {/* Solution Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-vault-textMuted">
                    Proposed Solution & Methodology <span className="text-vault-cyan">*</span>
                  </label>
                  <span className="text-[11px] text-vault-textMuted">
                    Technical architecture & algorithms
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your technical approach, machine learning models, system architecture, or novel integration..."
                  className="w-full px-4 py-3 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm placeholder-vault-textMuted/40 focus:outline-none focus:border-vault-cyan focus:ring-1 focus:ring-vault-cyan transition-all resize-none"
                  required
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-2">
                  Technologies & Frameworks <span className="text-vault-cyan">*</span>
                </label>
                <div className="relative">
                  <Cpu className="w-4 h-4 text-vault-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="e.g. Python, PyTorch, Docker, PostgreSQL, React, WebSockets"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm placeholder-vault-textMuted/40 focus:outline-none focus:border-vault-cyan focus:ring-1 focus:ring-vault-cyan transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-vault-textMuted mt-1.5">
                  Comma-separated list of programming languages, libraries, hardware, and tools.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-vault-border/60 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={analyzing || savingDraft}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-vault-violet via-vault-violetDark to-vault-cyan text-white text-sm font-bold hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-vault-violet/25 flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Computing Similarity Vector...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-vault-cyanLight" />
                      <span>Run Similarity Analysis</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={analyzing || savingDraft}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-vault-cardHover hover:bg-vault-border text-vault-text text-sm font-semibold border border-vault-border transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingDraft ? (
                    <div className="w-4 h-4 border-2 border-vault-cyan/30 border-t-vault-cyan rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-vault-textMuted" />
                  )}
                  <span>Save Draft</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: Drafts & History (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Drafts Section */}
          <div className="p-5 rounded-2xl bg-vault-card/70 border border-vault-border shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-vault-cyan" />
                <h3 className="text-sm font-bold text-white font-heading">
                  Saved Drafts ({drafts.length})
                </h3>
              </div>
            </div>

            {drafts.length === 0 ? (
              <p className="text-xs text-vault-textMuted py-3 text-center">
                No active drafts. You can save unsubmitted ideas to work on later.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleLoadDraft(d)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      ideaId === d.id
                        ? 'bg-vault-violet/15 border-vault-violet/40 shadow-sm'
                        : 'bg-vault-bg/60 border-vault-border/60 hover:border-vault-borderLight hover:bg-vault-cardHover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs text-white line-clamp-1">
                        {d.title}
                      </div>
                      <button
                        onClick={(e) => handleDelete(d.id, e)}
                        className="text-vault-textMuted hover:text-red-400 p-0.5 rounded transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-vault-textMuted mt-1 line-clamp-1">
                      {d.technologies || 'No technologies specified'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Analyses History */}
          <div className="p-5 rounded-2xl bg-vault-card/70 border border-vault-border shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-vault-violetLight" />
                <h3 className="text-sm font-bold text-white font-heading">
                  Past Analyses ({analyzedIdeas.length})
                </h3>
              </div>
              <button
                onClick={fetchIdeas}
                className="text-vault-textMuted hover:text-white p-1 rounded-lg transition-colors"
                title="Refresh history"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-6 flex justify-center">
                <div className="w-5 h-5 border-2 border-vault-violet/30 border-t-vault-cyan rounded-full animate-spin" />
              </div>
            ) : analyzedIdeas.length === 0 ? (
              <p className="text-xs text-vault-textMuted py-4 text-center">
                You haven't run any similarity analyses yet. Fill in the form and click "Run Similarity Analysis".
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {analyzedIdeas.map((item) => {
                  const scorePct = item.overall_score !== null ? Math.round(item.overall_score * 100) : 0;
                  const isHigh = scorePct >= 50;
                  const isModerate = scorePct >= 25 && scorePct < 50;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectAnalysis(item.id)}
                      className="p-3.5 rounded-xl bg-vault-bg/60 border border-vault-border/60 hover:border-vault-cyan/40 hover:bg-vault-cardHover transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-white line-clamp-1 group-hover:text-vault-cyan transition-colors">
                          {item.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-vault-textMuted group-hover:text-vault-cyan shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            isHigh
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : isModerate
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {scorePct}% Similarity
                        </span>

                        <span className="text-[10px] text-vault-textMuted">
                          {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
