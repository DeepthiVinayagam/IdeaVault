import React from 'react';
import { X, Calendar, Building2, Users, Cpu, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-vault-card border border-vault-border shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-vault-bg/60 text-vault-textMuted hover:text-white hover:bg-vault-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          {project.status === 'approved' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Faculty Approved
            </span>
          ) : project.status === 'rejected' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5" /> Rejected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" /> Pending Review
            </span>
          )}
          <span className="text-xs text-vault-textMuted flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Completed in {project.year}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-white font-heading leading-tight mb-4">
          {project.title}
        </h2>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-vault-bg/50 border border-vault-border/60 mb-6 text-sm">
          <div className="flex items-center gap-2.5 text-vault-textMuted">
            <Building2 className="w-4 h-4 text-vault-cyan shrink-0" />
            <div>
              <span className="text-xs text-vault-textMuted block">Department</span>
              <span className="text-white font-medium">{project.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-vault-textMuted">
            <Users className="w-4 h-4 text-vault-violet shrink-0" />
            <div>
              <span className="text-xs text-vault-textMuted block">Student Author(s)</span>
              <span className="text-white font-medium">{project.student_names}</span>
            </div>
          </div>
        </div>

        {/* Technologies */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-vault-textMuted flex items-center gap-1.5 mb-2">
            <Cpu className="w-4 h-4 text-vault-cyan" /> Tech Stack & Tools
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.split(',').map((tech, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-vault-border/60 text-vault-cyanLight border border-vault-border"
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Abstract */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-vault-textMuted mb-2">
            Project Abstract
          </h4>
          <p className="text-sm leading-relaxed text-vault-text/90 whitespace-pre-line bg-vault-bg/30 p-4 rounded-xl border border-vault-border/40">
            {project.abstract}
          </p>
        </div>

        {/* Faculty Review Notes if present */}
        {project.review_notes && (
          <div className="p-4 rounded-xl bg-vault-violet/10 border border-vault-violet/20 text-xs">
            <span className="font-semibold text-vault-violetLight block mb-1">
              Faculty Review Notes {project.approver_name ? `(Reviewed by ${project.approver_name})` : ''}:
            </span>
            <p className="text-vault-text/90 italic">{project.review_notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-vault-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-vault-border text-white text-sm font-medium hover:bg-vault-borderLight transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
