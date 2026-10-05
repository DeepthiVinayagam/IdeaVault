import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading data...', size = 'default' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-vault-violet/20 border-t-vault-cyan animate-spin" />
        <div className="absolute w-8 h-8 rounded-full border-2 border-vault-cyan/30 border-b-vault-violet animate-spin [animation-direction:reverse]" />
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-vault-textMuted animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
