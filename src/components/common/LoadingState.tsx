import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading placement data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium">{message}</p>
    </div>
  );
};
