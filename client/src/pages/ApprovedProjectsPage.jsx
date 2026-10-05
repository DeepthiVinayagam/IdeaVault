import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import ProjectModal from '../components/ProjectModal';
import { 
  Search, 
  Filter, 
  FolderGit2, 
  Calendar, 
  Building2, 
  Users, 
  Cpu, 
  CheckCircle2, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function ApprovedProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (department !== 'All') params.department = department;
      if (year !== 'All') params.year = year;

      const data = await api.getProjects(params);
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, department, year]);

  // Department options
  const departments = [
    'All',
    'Computer Science',
    'Data Science & AI',
    'Cybersecurity & Blockchain',
    'Cybersecurity',
    'Electrical & Computer Engineering',
    'Biomedical & Software Engineering',
    'Internet of Things (IoT)',
    'Environmental & Computer Engineering'
  ];

  const years = ['All', '2024', '2023', '2022'];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Faculty-Verified Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Completed Projects Catalog
          </h1>
          <p className="text-sm text-vault-textMuted mt-1">
            Browse through historical faculty-approved capstone and thesis projects for research inspiration.
          </p>
        </div>

        <button
          onClick={fetchProjects}
          className="p-2.5 rounded-xl bg-vault-card border border-vault-border text-vault-text hover:text-white transition-colors self-start sm:self-center"
          title="Refresh catalog"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-vault-card border border-vault-border shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input (6 cols) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-vault-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by keyword, technology, or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm placeholder-vault-textMuted/50 focus:outline-none focus:border-vault-cyan transition-all"
            />
          </div>

          {/* Department Filter (4 cols) */}
          <div className="md:col-span-4">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm focus:outline-none focus:border-vault-cyan transition-all"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-vault-bg text-white">
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-vault-bg/80 border border-vault-border text-white text-sm focus:outline-none focus:border-vault-cyan transition-all"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-vault-bg text-white">
                  {y === 'All' ? 'All Years' : y}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="text-xs text-vault-textMuted flex items-center justify-between pt-1">
          <span>Found <strong className="text-white">{projects.length}</strong> approved project{projects.length === 1 ? '' : 's'}</span>
          {(searchTerm || department !== 'All' || year !== 'All') && (
            <button
              onClick={() => { setSearchTerm(''); setDepartment('All'); setYear('All'); }}
              className="text-vault-cyan hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorAlert message={error} />}

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching approved projects repository..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects found"
          description="Try broadening your search term or selecting a different department filter."
          actionText="Clear Filters"
          onAction={() => { setSearchTerm(''); setDepartment('All'); setYear('All'); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-2xl bg-vault-card border border-vault-border hover:border-vault-cyan/40 hover:bg-vault-cardHover transition-all flex flex-col justify-between space-y-4 group shadow-md"
            >
              <div className="space-y-3">
                {/* Meta tags */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-vault-violet/15 text-vault-violetLight border border-vault-violet/30 font-semibold truncate">
                    {proj.department}
                  </span>
                  <span className="text-vault-textMuted flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5" /> {proj.year}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-white font-heading leading-snug group-hover:text-vault-cyan transition-colors line-clamp-2">
                  {proj.title}
                </h3>

                {/* Abstract Preview */}
                <p className="text-xs text-vault-textMuted leading-relaxed line-clamp-3">
                  {proj.abstract}
                </p>
              </div>

              {/* Technologies & Student Team */}
              <div className="pt-3 border-t border-vault-border/60 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.split(',').slice(0, 4).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-vault-bg text-vault-cyanLight border border-vault-border/80"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                  {proj.technologies.split(',').length > 4 && (
                    <span className="text-[10px] text-vault-textMuted self-center">
                      +{proj.technologies.split(',').length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-vault-textMuted truncate max-w-[200px]">
                    By: <span className="text-vault-text">{proj.student_names}</span>
                  </span>

                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="px-3 py-1.5 rounded-lg bg-vault-violet/20 hover:bg-vault-violet/30 text-vault-cyan font-semibold text-xs border border-vault-violet/30 transition-all flex items-center gap-1"
                  >
                    <span>Read Abstract</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
