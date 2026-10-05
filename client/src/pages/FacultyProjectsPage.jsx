import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import ProjectModal from '../components/ProjectModal';
import { 
  ShieldCheck, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ExternalLink, 
  Filter, 
  Cpu, 
  Building2, 
  Calendar, 
  Users,
  AlertCircle
} from 'lucide-react';

export default function FacultyProjectsPage() {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'add' | 'all'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add Project Form State
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [studentNames, setStudentNames] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Review Modal State
  const [reviewingProject, setReviewingProject] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState(null); // 'approved' | 'rejected'
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Detail modal
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects({ status: activeTab === 'review' ? 'pending' : undefined });
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  // Handle Add Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !abstract.trim() || !technologies.trim() || !department.trim() || !studentNames.trim()) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createProject({
        title: title.trim(),
        abstract: abstract.trim(),
        technologies: technologies.trim(),
        department: department.trim(),
        year: parseInt(year, 10),
        student_names: studentNames.trim(),
        status: 'approved'
      });

      setSuccess(`Project "${title}" added and approved successfully!`);
      // Reset form
      setTitle('');
      setAbstract('');
      setTechnologies('');
      setStudentNames('');
      setActiveTab('all');
    } catch (err) {
      setError(err.message || 'Failed to add project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Update (Approve / Reject)
  const handleConfirmReview = async () => {
    if (!reviewingProject || !reviewAction) return;

    setUpdatingStatus(true);
    setError(null);
    try {
      await api.updateProjectStatus(reviewingProject.id, reviewAction, reviewNotes);
      setSuccess(`Project has been ${reviewAction}.`);
      setReviewingProject(null);
      setReviewNotes('');
      setReviewAction(null);
      fetchProjects();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to update project status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Delete Project
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project from the repository?')) return;

    try {
      await api.deleteProject(id);
      setSuccess('Project deleted successfully.');
      fetchProjects();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    }
  };

  const pendingProjects = projects.filter(p => p.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-vault-violet/15 text-vault-violetLight border border-vault-violet/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Faculty Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Faculty Project Review Hub
          </h1>
          <p className="text-sm text-vault-textMuted mt-1">
            Review student submissions, approve capstone projects for similarity matching, and register new completed projects.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-vault-border/80 pb-3">
        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'review'
              ? 'bg-vault-violet/20 text-vault-cyan border border-vault-violet/40 shadow-sm'
              : 'text-vault-textMuted hover:text-white hover:bg-vault-cardHover'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Review Queue</span>
          {pendingProjects.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {pendingProjects.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'add'
              ? 'bg-vault-violet/20 text-vault-cyan border border-vault-violet/40 shadow-sm'
              : 'text-vault-textMuted hover:text-white hover:bg-vault-cardHover'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Completed Project</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-vault-violet/20 text-vault-cyan border border-vault-violet/40 shadow-sm'
              : 'text-vault-textMuted hover:text-white hover:bg-vault-cardHover'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>All Repository Projects</span>
        </button>
      </div>

      {/* Tab 1: Pending Review Queue */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          {loading ? (
            <LoadingSpinner text="Checking pending submission queue..." />
          ) : pendingProjects.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Review queue is clear"
              description="There are currently no pending student projects waiting for faculty approval."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-6 rounded-2xl bg-vault-card border border-amber-500/30 shadow-lg space-y-4 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Faculty Decision</span>
                        <span>•</span>
                        <span className="text-vault-textMuted">{p.department} ({p.year})</span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-heading">{p.title}</h3>
                      <p className="text-xs text-vault-textMuted mt-1">
                        Student Authors: <strong className="text-white">{p.student_names}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setReviewingProject(p);
                          setReviewAction('approved');
                          setReviewNotes('Approved for inclusion in institutional project repository.');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Project</span>
                      </button>

                      <button
                        onClick={() => {
                          setReviewingProject(p);
                          setReviewAction('rejected');
                          setReviewNotes('Project does not meet technical documentation requirements.');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-vault-text/90 bg-vault-bg/60 p-3.5 rounded-xl border border-vault-border/50">
                    {p.abstract}
                  </p>

                  <div className="flex items-center justify-between text-xs text-vault-textMuted">
                    <span>Technologies: <strong className="text-vault-cyan">{p.technologies}</strong></span>
                    <button
                      onClick={() => setSelectedProject(p)}
                      className="text-vault-cyan hover:underline flex items-center gap-1"
                    >
                      Full Details <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Add Completed Project Form */}
      {activeTab === 'add' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-vault-border shadow-2xl max-w-3xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white font-heading">
              Register Completed Capstone / Thesis Project
            </h2>
            <p className="text-xs text-vault-textMuted mt-1">
              Adding a completed project includes it directly in the IdeaVault TF-IDF repository for similarity comparisons.
            </p>
          </div>

          <form onSubmit={handleAddProject} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-1.5">
                Project Title <span className="text-vault-cyan">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Autonomous Thermal Wildfire Detection Drone"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm focus:outline-none focus:border-vault-cyan transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-1.5">
                  Academic Department <span className="text-vault-cyan">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm focus:outline-none focus:border-vault-cyan transition-all"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Cybersecurity & Blockchain">Cybersecurity & Blockchain</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Electrical & Computer Engineering">Electrical & Computer Engineering</option>
                  <option value="Biomedical & Software Engineering">Biomedical & Software Engineering</option>
                  <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                  <option value="Environmental & Computer Engineering">Environmental & Computer Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-1.5">
                  Completion Year <span className="text-vault-cyan">*</span>
                </label>
                <input
                  type="number"
                  min="2018"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm focus:outline-none focus:border-vault-cyan transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-1.5">
                Student Author Names <span className="text-vault-cyan">*</span>
              </label>
              <input
                type="text"
                value={studentNames}
                onChange={(e) => setStudentNames(e.target.value)}
                placeholder="e.g. Marcus Chen, Sarah Jenkins"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm focus:outline-none focus:border-vault-cyan transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-1.5">
                Technologies & Tools <span className="text-vault-cyan">*</span>
              </label>
              <input
                type="text"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="e.g. Python, PyTorch, YOLOv8, LoRaWAN, Raspberry Pi, C++"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm focus:outline-none focus:border-vault-cyan transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-1.5">
                Project Abstract <span className="text-vault-cyan">*</span>
              </label>
              <textarea
                rows={4}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Detailed abstract explaining the problem solved, methodology, algorithms, and results..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm focus:outline-none focus:border-vault-cyan transition-all resize-none"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-vault-violet to-vault-cyan text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-vault-violet/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Register & Approve Project</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: All Managed Projects */}
      {activeTab === 'all' && (
        <div className="p-6 rounded-3xl bg-vault-card border border-vault-border shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-vault-border/60">
            <h3 className="text-base font-bold text-white font-heading">
              Repository Projects ({projects.length})
            </h3>
            <span className="text-xs text-vault-textMuted">
              Manage status and catalog entries
            </span>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading repository..." />
          ) : projects.length === 0 ? (
            <EmptyState title="No projects found in repository" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-vault-border text-vault-textMuted uppercase tracking-wider">
                    <th className="py-3 px-3">Title & Authors</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-border/60 text-vault-text">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-vault-cardHover transition-colors">
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-semibold text-white truncate">{proj.title}</div>
                        <div className="text-[11px] text-vault-textMuted truncate">{proj.student_names}</div>
                      </td>
                      <td className="py-3.5 px-3 text-vault-textMuted whitespace-nowrap">
                        {proj.department}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {proj.year}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          proj.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : proj.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => setSelectedProject(proj)}
                          className="px-2.5 py-1 rounded-lg bg-vault-bg hover:bg-vault-border text-vault-cyan text-xs font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1 rounded-lg text-vault-textMuted hover:text-red-400 transition-colors"
                          title="Delete from catalog"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Decision Modal */}
      {reviewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-vault-card border border-vault-border p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-heading">
              {reviewAction === 'approved' ? 'Approve Project' : 'Reject Project'}
            </h3>
            <p className="text-xs text-vault-textMuted">
              Provide feedback / review notes for: <strong className="text-white">{reviewingProject.title}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-vault-textMuted uppercase mb-1.5">
                Faculty Review Notes
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional feedback notes for the record..."
                className="w-full px-3.5 py-2 rounded-xl bg-vault-bg border border-vault-border text-white text-xs focus:outline-none focus:border-vault-cyan resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setReviewingProject(null)}
                className="px-4 py-2 rounded-xl bg-vault-bg border border-vault-border text-vault-text text-xs hover:bg-vault-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReview}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                  reviewAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {updatingStatus ? 'Updating...' : `Confirm ${reviewAction === 'approved' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Project Detail Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

    </div>
  );
}
