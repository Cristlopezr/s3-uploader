export interface StorageFile {
  id: string;
  originalName: string;
  size: number;
  contentType: string;
  createdAt: string;
}

export type UploadStateStatus = 
  | 'idle'
  | 'selected'
  | 'requesting-url'
  | 'uploading'
  | 'success'
  | 'error';

export interface UploadProgress {
  status: UploadStateStatus;
  errorMessage?: string;
}
