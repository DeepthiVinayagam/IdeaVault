import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import { FileText, User, Calendar, Trash2, ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminIdeasPage({ onSelectAnalysis }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIdeas();
      setIdeas(data.ideas || []);
    } catch (err) {
      setError(err.message || 'Failed to load student submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student submission from the database?')) return;
    try {
      await api.deleteIdea(id);
      fetchIdeas();
    } catch (err) {
      setError(err.message || 'Failed to delete submission.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Student Submissions Oversight
          </h1>
          <p className="text-sm text-vault-textMuted mt-1">
            Global repository of student project idea proposals and automated similarity evaluation results.
          </p>
        </div>

        <button
          onClick={fetchIdeas}
          className="p-2.5 rounded-xl bg-vault-card border border-vault-border text-vault-text hover:text-white transition-colors"
          title="Refresh submissions"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner text="Retrieving student ideas database..." />
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No student ideas submitted"
          description="When students compose and analyze ideas, they will appear here."
        />
      ) : (
        <div className="p-6 rounded-3xl bg-vault-card border border-vault-border shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vault-border text-vault-textMuted uppercase tracking-wider">
                  <th className="py-3 px-3">Project Title</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Similarity</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border/60 text-vault-text">
                {ideas.map((idea) => {
                  const scorePct = idea.overall_score !== null ? Math.round(idea.overall_score * 100) : null;
                  return (
                    <tr key={idea.id} className="hover:bg-vault-cardHover transition-colors">
                      <td className="py-3.5 px-3 max-w-xs font-semibold text-white">
                        <div className="truncate">{idea.title}</div>
                        <div className="text-[11px] text-vault-textMuted truncate">{idea.technologies}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-vault-text">{idea.student_name || 'Student'}</div>
                        <div className="text-[11px] text-vault-textMuted">{idea.student_email}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          idea.status === 'analyzed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {idea.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {scorePct !== null ? (
                          <span className="font-bold text-vault-cyan">{scorePct}%</span>
                        ) : (
                          <span className="text-vault-textMuted">Pending Analysis</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-vault-textMuted">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-2">
                        {idea.status === 'analyzed' && (
                          <button
                            onClick={() => onSelectAnalysis(idea.id)}
                            className="px-2.5 py-1 rounded-lg bg-vault-bg hover:bg-vault-border text-vault-cyan text-xs font-medium"
                          >
                            Analysis
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(idea.id)}
                          className="p-1.5 rounded-lg text-vault-textMuted hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
