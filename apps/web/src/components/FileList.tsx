import React, { useState } from 'react';
import {
  Folder,
  Search,
  Grid,
  List,
  FileText,
  Image as ImageIcon,
  FileCode,
  Film,
  Music,
  Archive,
  File,
  Download,
  Loader2
} from 'lucide-react';
import type { StorageFile } from '../types';

interface FileListProps {
  files: StorageFile[];
  isLoading: boolean;
}

export const FileList: React.FC<FileListProps> = ({ files, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const filteredFiles = files.filter(f =>
    f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <ImageIcon size={22} />;
    if (contentType.startsWith('video/')) return <Film size={22} />;
    if (contentType.startsWith('audio/')) return <Music size={22} />;
    if (contentType.includes('zip') || contentType.includes('tar') || contentType.includes('rar')) return <Archive size={22} />;
    if (contentType.includes('json') || contentType.includes('javascript') || contentType.includes('typescript') || contentType.includes('html')) return <FileCode size={22} />;
    if (contentType.includes('pdf') || contentType.includes('document') || contentType.includes('text')) return <FileText size={22} />;
    return <File size={22} />;
  };

  const handleGetDownloadUrl = async (file: StorageFile) => {
    setLoadingFileId(file.id);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/storage/files/${file.id}/download-url`);
      if (!response.ok) throw new Error('Failed to fetch presigned download URL');
      const { presignedUrl } = await response.json();
      window.open(presignedUrl, '_blank');
    } catch (err) {
      console.error('Error fetching download URL:', err);
    } finally {
      setLoadingFileId(null);
    }
  };

  return (
    <div className="p-6 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-lg font-semibold text-slate-100 flex items-center gap-2.5">
          <Folder size={22} className="text-cyan-400" />
          <span>S3 File Manager</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 justify-end">
          <div className="relative flex-1 max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full pl-9 pr-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-5 bg-slate-900/60 border border-white/5 rounded-xl animate-pulse flex flex-col justify-between gap-4 h-40">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-white/10" />
                <div className="w-20 h-7 rounded-lg bg-white/10" />
              </div>
              <div className="w-3/4 h-4 bg-white/10 rounded" />
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="w-16 h-3 bg-white/10 rounded" />
                <div className="w-20 h-3 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-16 px-4 text-center flex flex-col items-center gap-3 text-slate-400">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
            <File size={28} />
          </div>
          <h3 className="font-semibold text-slate-300">No files found</h3>
          <p className="text-xs text-slate-500">{searchQuery ? `No files matching "${searchQuery}"` : 'Upload your first file using the dropzone above.'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div key={file.id} className="p-5 bg-slate-900/60 hover:bg-slate-800/60 border border-white/10 hover:border-white/20 rounded-xl transition-all flex flex-col justify-between gap-4 group">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  {getFileIcon(file.contentType)}
                </div>
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                  onClick={() => handleGetDownloadUrl(file)}
                  disabled={loadingFileId === file.id}
                  title="Open / Download File"
                >
                  {loadingFileId === file.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2" title={file.originalName}>
                  {file.originalName}
                </h4>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                <span>{formatFileSize(file.size)}</span>
                <span>{formatDate(file.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredFiles.map((file) => (
            <div key={file.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-800/60 border border-white/10 hover:border-white/20 rounded-xl transition-all gap-4">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  {getFileIcon(file.contentType)}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="font-semibold text-sm text-slate-100 truncate" title={file.originalName}>{file.originalName}</span>
                  <span className="text-xs text-slate-500">{file.contentType}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                <span className="text-xs text-slate-400">{formatFileSize(file.size)}</span>
                <span className="text-xs text-slate-400">{formatDate(file.createdAt)}</span>
                <button
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                  onClick={() => handleGetDownloadUrl(file)}
                  disabled={loadingFileId === file.id}
                  title="Open / Download File"
                >
                  {loadingFileId === file.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
