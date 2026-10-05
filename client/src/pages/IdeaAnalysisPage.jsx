import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ProjectModal from '../components/ProjectModal';
import { 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  Tag, 
  Building2, 
  Calendar, 
  Cpu, 
  FileText,
  ShieldAlert
} from 'lucide-react';

export default function IdeaAnalysisPage({ ideaId, initialAnalysis, onBack, onEditIdea }) {
  const [loading, setLoading] = useState(!initialAnalysis);
  const [error, setError] = useState(null);
  const [idea, setIdea] = useState(null);
  const [analysis, setAnalysis] = useState(initialAnalysis || null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    async function loadAnalysisDetails() {
      if (!ideaId) return;
      setLoading(true);
      try {
        const data = await api.getIdea(ideaId);
        setIdea(data.idea);
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
      } catch (err) {
        setError(err.message || 'Failed to load analysis results.');
      } finally {
        setLoading(false);
      }
    }

    if (!initialAnalysis || !idea) {
      loadAnalysisDetails();
    }
  }, [ideaId, initialAnalysis]);

  if (loading) {
    return <LoadingSpinner text="Retrieving comprehensive similarity breakdown..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-vault-textMuted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </button>
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-vault-textMuted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </button>
        <ErrorAlert message="No analysis found for this idea. Please run an analysis from the workspace." />
      </div>
    );
  }

  const scorePct = Math.round((analysis.overall_score || 0) * 100);
  const hasHighOverlap = scorePct >= 65;
  const hasModerateOverlap = scorePct >= 35 && scorePct < 65;
  const isNovel = scorePct < 35;

  const scoreBadgeColor = hasHighOverlap
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : hasModerateOverlap
    ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  const scoreStatusLabel = hasHighOverlap
    ? 'High Similarity Overlap'
    : hasModerateOverlap
    ? 'Moderate Domain Overlap'
    : 'High Domain Novelty (Low Overlap)';

  const topMatches = analysis.top_matches || [];
  const suggestions = analysis.suggestions || [];
  const sharedKeywords = analysis.shared_keywords || [];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
      
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-vault-textMuted hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Workspace</span>
        </button>

        <div className="flex items-center gap-3">
          {idea && (
            <button
              onClick={() => onEditIdea(idea)}
              className="px-4 py-2 rounded-xl bg-vault-cardHover hover:bg-vault-border text-xs font-semibold text-vault-text border border-vault-border transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-vault-cyan" />
              <span>Edit & Re-Analyze</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Overview Score Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-vault-border shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-vault-violet/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Circular Score Badge (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer glowing track */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#232E4D"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={hasHighOverlap ? '#F59E0B' : hasModerateOverlap ? '#38BDF8' : '#10B981'}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - (analysis.overall_score || 0))}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Percentage */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white font-heading">
                  {scorePct}%
                </span>
                <span className="text-[10px] text-vault-textMuted uppercase tracking-wider font-semibold">
                  Similarity
                </span>
              </div>
            </div>

            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${scoreBadgeColor}`}>
              {scoreStatusLabel}
            </div>
          </div>

          {/* Details & Explanation (8 cols) */}
          <div className="md:col-span-8 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-vault-cyan flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Semantic Similarity Synthesis</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading leading-snug">
              {idea ? idea.title : 'Project Idea Analysis'}
            </h2>

            <p className="text-sm leading-relaxed text-vault-text/90">
              {analysis.explanation}
            </p>

            {/* Shared Keywords Tag Pills */}
            {sharedKeywords.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-vault-textMuted uppercase tracking-wider block mb-1.5">
                  Core Shared Keywords & Concepts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sharedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-vault-violet/15 text-vault-cyanLight border border-vault-violet/30"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Advisory & Plagiarism Disclaimer */}
        <div className="mt-6 pt-5 border-t border-vault-border/60 flex items-start gap-3 p-4 rounded-2xl bg-vault-bg/60 border border-vault-border/50 text-xs text-vault-textMuted">
          <ShieldAlert className="w-4 h-4 text-vault-cyan shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-vault-text">Academic Advisory Notice:</span> {analysis.disclaimer || 'Similarity analysis highlights keyword and topical overlap against approved historical projects. It is an advisory tool for literature review and uniqueness refinement, not proof of plagiarism or guaranteed novelty.'}
          </p>
        </div>

      </div>

      {/* Top 3 Matching Completed Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-vault-cyan" />
            <h3 className="text-lg font-bold text-white font-heading">
              Top Matching Approved Projects ({topMatches.length})
            </h3>
          </div>
          <span className="text-xs text-vault-textMuted">
            Ranked by Cosine Similarity Vector
          </span>
        </div>

        {topMatches.length === 0 || !analysis.has_matches ? (
          <div className="p-8 rounded-2xl bg-vault-card/50 border border-vault-border text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No Closely Matching Records Found</h4>
            <p className="text-xs text-vault-textMuted max-w-md mx-auto">
              The IdeaVault repository contains no previously approved projects with substantial topical overlap. Your proposed concept appears novel within this institution's catalog!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {topMatches.map((match, index) => {
              const matchScorePct = Math.round((match.similarity_score || 0) * 100);
              return (
                <div
                  key={match.id || index}
                  className="p-5 sm:p-6 rounded-2xl bg-vault-card border border-vault-border hover:border-vault-cyan/40 transition-all shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-vault-textMuted">
                        <span className="font-bold text-vault-cyan">#{index + 1} Best Match</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {match.department}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {match.year}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white font-heading">
                        {match.title}
                      </h4>
                      <p className="text-xs text-vault-textMuted">
                        Authors: <span className="text-vault-text">{match.student_names}</span>
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center sm:flex-col items-end gap-2">
                      <span className="px-3 py-1 rounded-xl bg-vault-violet/20 border border-vault-violet/40 text-vault-cyanLight font-extrabold text-sm">
                        {matchScorePct}% Match
                      </span>
                      <button
                        onClick={() => setSelectedProject(match)}
                        className="px-3 py-1.5 rounded-lg bg-vault-bg hover:bg-vault-cardHover text-xs font-semibold text-vault-cyan border border-vault-border hover:border-vault-cyan/30 transition-colors flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Shared Keywords */}
                  {match.shared_keywords && match.shared_keywords.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      <span className="text-xs text-vault-textMuted mr-1">Shared Keywords:</span>
                      {match.shared_keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-vault-border text-vault-cyanLight"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Why it matched */}
                  <div className="p-3.5 rounded-xl bg-vault-bg/60 border border-vault-border/50 text-xs text-vault-text/90">
                    <span className="font-bold text-vault-violetLight block mb-0.5">
                      Match Rationale:
                    </span>
                    <p>{match.match_explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actionable Improvement Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white font-heading">
            Actionable Recommendations to Elevate Your Project
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-vault-card/90 border border-vault-border hover:border-vault-violet/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-vault-violet/15 text-vault-violetLight border border-vault-violet/30 inline-block mb-2">
                  {sug.category || 'Recommendation'}
                </span>
                <h4 className="text-sm font-bold text-white font-heading mb-1.5">
                  {sug.title}
                </h4>
                <p className="text-xs leading-relaxed text-vault-textMuted">
                  {sug.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Project Full Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

    </div>
  );
}
