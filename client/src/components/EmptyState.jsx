import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = 'No items found', 
  description = 'There are no records available in this view yet.',
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-vault-border/50 bg-vault-card/40 my-4">
      <div className="w-14 h-14 rounded-2xl bg-vault-violet/10 border border-vault-violet/20 flex items-center justify-center text-vault-cyan mb-4 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-vault-text font-heading">{title}</h3>
      <p className="mt-1.5 text-sm text-vault-textMuted max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-xl bg-gradient-to-r from-vault-violet to-vault-violetDark text-white text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-vault-violet/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
