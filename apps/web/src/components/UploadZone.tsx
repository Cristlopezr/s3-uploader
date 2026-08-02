import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { StorageFile, UploadProgress } from '../types';

const POLLING_INTERVAL_MS = 3000;
const MAX_POLLING_ATTEMPTS = 30; // ~1.5 minutes max

interface UploadZoneProps {
  onFileActivated: (newFile: StorageFile) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileActivated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadProgress>({
    status: 'idle',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingAttemptsRef = useRef(0);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingAttemptsRef.current = 0;
  };

  const startPolling = (fileId: string) => {
    stopPolling();
    setUploadState({ status: 'polling' });

    pollingIntervalRef.current = setInterval(async () => {
      pollingAttemptsRef.current += 1;

      if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
        stopPolling();
        setUploadState({
          status: 'error',
          errorMessage: 'File verification timed out. Please try again.',
        });
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/storage/files/${fileId}`
        );

        if (!response.ok) throw new Error('Failed to check file status');

        const file: StorageFile = await response.json();

        if (file.status === 'ACTIVE') {
          stopPolling();
          onFileActivated(file);
          setUploadState({ status: 'success' });
        } else if (file.status === 'FAILED') {
          stopPolling();
          setUploadState({
            status: 'validation-failed',
            errorMessage: 'File validation failed',
          });
        }
        // If still PENDING, continue polling
      } catch (err) {
        console.error('Polling error:', err);
        // Don't stop polling on transient network errors, just log
      }
    }, POLLING_INTERVAL_MS);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadState({ status: 'selected' });

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClear = () => {
    stopPolling();
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadState({ status: 'idle' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadState({ status: 'requesting-url' });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/storage/files/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          size: selectedFile.size
        }),
      });

      if (!response.ok) throw new Error('Failed to obtain upload presigned URL');
      const { presignedUrl, file } = await response.json();

      setUploadState({ status: 'uploading' });
      const s3UploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      });

      if (!s3UploadResponse.ok) throw new Error('Failed to upload file to S3');

      startPolling(file.id);

    } catch (err: any) {
      console.error('Upload Error:', err);
      setUploadState({
        status: 'error',
        errorMessage: 'Error uploading file'
      });
    }
  };

  const isUploading = uploadState.status === 'uploading' || uploadState.status === 'requesting-url';
  const isPolling = uploadState.status === 'polling';
  const isBusy = isUploading || isPolling;

  const getStatusLabel = (): string => {
    switch (uploadState.status) {
      case 'requesting-url': return 'Getting Presigned URL...';
      case 'uploading': return 'Uploading to S3...';
      case 'polling': return 'Verifying file...';
      default: return 'Upload File';
    }
  };

  return (
    <div className="p-6 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2.5">
          <UploadCloud size={22} className="text-indigo-400" />
          <span>Upload File to S3</span>
        </h2>

        {selectedFile && !isBusy && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md"
            onClick={handleClear}
          >
            <UploadCloud size={14} />
            <span>Select Another File</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center bg-slate-950/40 transition-all cursor-pointer group flex flex-col items-center gap-4 ${isDragging
            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
            : 'border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/5'
            }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:-translate-y-1 transition-all duration-300">
            <UploadCloud size={32} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">Drag and drop your file here</h3>
            <p className="text-xs text-slate-400">Supports documents, images, videos, audio & archives</p>
          </div>
          <button type="button" className="mt-1 px-4 py-2 bg-white/5 group-hover:bg-white/10 border border-white/10 rounded-lg text-slate-200 font-medium text-xs transition-all">
            Browse Computer
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-11 h-11 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <File size={24} />
              </div>
            )}

            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="font-semibold text-sm text-slate-100 truncate max-w-xs" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="text-xs text-slate-400">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown Type'}
              </span>

              {(isUploading || isPolling) && (
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
                  <div className={`h-full rounded-full w-full ${
                    isPolling 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 animate-pulse' 
                      : 'bg-gradient-to-r from-indigo-500 to-cyan-500 animate-pulse'
                  }`} />
                </div>
              )}

              {isPolling && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Loader2 size={12} className="animate-spin text-amber-400" />
                  <span className="text-xs text-amber-400">Verifying file with server...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {uploadState.status === 'success' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={16} />
                <span>Verified & Active!</span>
              </div>
            ) : uploadState.status === 'validation-failed' ? (
              <div className="flex items-center gap-2.5">
                <div className="inline-flex flex-col items-start gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={16} />
                    <span>Validation Failed</span>
                  </div>
                  {uploadState.errorMessage && (
                    <span className="text-[10px] font-normal text-rose-300/70">{uploadState.errorMessage}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  onClick={handleClear}
                >
                  <X size={14} />
                  <span>Try again</span>
                </button>
              </div>
            ) : uploadState.status === 'error' ? (
              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertCircle size={16} />
                  <span>Upload Failed</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  onClick={handleClear}
                >
                  <X size={14} />
                  <span>Try again</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                  onClick={handleClear}
                  disabled={isBusy}
                >
                  <X size={16} />
                  <span>Clear</span>
                </button>
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none cursor-pointer"
                  onClick={handleStartUpload}
                  disabled={isBusy}
                >
                  {isBusy ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  <span>{getStatusLabel()}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

