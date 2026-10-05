import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm shadow-lg backdrop-blur-md animate-in fade-in">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="font-normal">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-200 p-1 rounded-lg hover:bg-red-900/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
