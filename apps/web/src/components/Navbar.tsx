import React from 'react';
import { Cloud, HardDrive, RefreshCw } from 'lucide-react';
import type { StorageFile } from '../types';

interface NavbarProps {
  files: StorageFile[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ files, onRefresh, isLoading }) => {
  const totalSize = files.reduce((acc, curr) => acc + (curr.size || 0), 0);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Cloud size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            S3 Bucket Storage
          </h1>
          <p className="text-xs text-slate-400 font-medium">Monorepo File Management App</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>AWS S3 Ready</span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-400">
          <HardDrive size={16} />
          <span><strong className="text-slate-200">{files.length}</strong> Files</span> ({formatSize(totalSize)})
        </div>

        <button 
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh File List"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </nav>
  );
};
