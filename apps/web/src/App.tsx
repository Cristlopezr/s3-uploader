import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { FileList } from './components/FileList';
import type { StorageFile } from './types';

export function App() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFilesFromBackend = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/storage/files`);

      if (!response.ok) throw new Error('Failed to fetch files');
      const data: StorageFile[] = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilesFromBackend();
  }, []);

  const handleFileUploadSuccess = (newFile: StorageFile) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 flex flex-col gap-8">
      {/* Top Header Navbar */}
      <Navbar
        files={files}
        onRefresh={fetchFilesFromBackend}
        isLoading={isLoading}
      />

      {/* Drag & Drop File Upload Section */}
      <UploadZone
        onFileUploadSuccess={handleFileUploadSuccess}
      />

      {/* S3 Files Browser & Direct Download/View */}
      <FileList
        files={files}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
