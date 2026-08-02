export interface StorageFile {
  id: string;
  originalName: string;
  size: number;
  contentType: string;
  createdAt: string;
  status: string;
}

export type UploadStateStatus = 
  | 'idle'
  | 'selected'
  | 'requesting-url'
  | 'uploading'
  | 'polling'
  | 'success'
  | 'validation-failed'
  | 'error';

export interface UploadProgress {
  status: UploadStateStatus;
  errorMessage?: string;
}
