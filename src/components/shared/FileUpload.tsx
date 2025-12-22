import React, { useState, useRef } from 'react';
import { uploadFile, FileMetadata } from '../../api/files.api';
import { validateFile, formatFileSize, getFileIcon, ALLOWED_MIME_TYPES } from '../../utils/fileUtils';
import { toast } from 'sonner';

export interface FileUploadProps {
  moduleType?: string;
  moduleId?: string;
  accessLevel?: 'public' | 'private' | 'restricted';
  maxSizeMB?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  onUploadComplete?: (files: FileMetadata[]) => void;
  onUploadError?: (error: Error) => void;
  accept?: string;
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  metadata?: FileMetadata;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  moduleType,
  moduleId,
  accessLevel = 'private',
  maxSizeMB = 10,
  allowedTypes = ALLOWED_MIME_TYPES,
  multiple = false,
  onUploadComplete,
  onUploadError,
  accept,
  className = '',
  buttonText = 'Upload File',
  showPreview = true,
}) => {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const validation = validateFile(file, { maxSizeMB, allowedTypes });
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    const newUploads: FileUploadState[] = fileArray.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    newUploads.forEach((upload, index) => {
      handleUpload(upload.file, uploads.length + index);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (file: File, index: number) => {
    try {
      setUploads((prev) =>
        prev.map((u, i) => (i === index ? { ...u, status: 'uploading' as const } : u))
      );

      const metadata = await uploadFile({
        file,
        moduleType,
        moduleId,
        accessLevel,
        onProgress: (progress) => {
          setUploads((prev) =>
            prev.map((u, i) => (i === index ? { ...u, progress } : u))
          );
        },
      });

      setUploads((prev) =>
        prev.map((u, i) =>
          i === index
            ? { ...u, status: 'success' as const, metadata, progress: 100 }
            : u
        )
      );

      toast.success(`File "${file.name}" uploaded successfully`);

      if (onUploadComplete) {
        const successfulUploads = uploads
          .filter((u) => u.status === 'success' && u.metadata)
          .map((u) => u.metadata!);
        onUploadComplete([...successfulUploads, metadata]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      setUploads((prev) =>
        prev.map((u, i) =>
          i === index ? { ...u, status: 'error' as const, error: errorMessage } : u
        )
      );

      toast.error(`Failed to upload "${file.name}": ${errorMessage}`);

      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }
    }
  };

  const handleRemove = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        multiple={multiple}
        accept={accept || allowedTypes.join(',')}
        style={{ display: 'none' }}
      />

      <button
        onClick={handleButtonClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {buttonText}
      </button>

      {showPreview && uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0 mr-3">
                  <FileIcon mimeType={upload.file.type} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(upload.file.size)}
                  </p>

                  {upload.status === 'uploading' && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}

                  {upload.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center ml-3">
                {upload.status === 'pending' && (
                  <span className="text-xs text-gray-500">Pending...</span>
                )}
                {upload.status === 'uploading' && (
                  <span className="text-xs text-blue-600">{upload.progress}%</span>
                )}
                {upload.status === 'success' && (
                  <span className="text-xs text-green-600">✓ Uploaded</span>
                )}
                {upload.status === 'error' && (
                  <button
                    onClick={() => handleUpload(upload.file, index)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Retry
                  </button>
                )}

                <button
                  onClick={() => handleRemove(index)}
                  className="ml-3 text-gray-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FileIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
  const iconName = getFileIcon(mimeType);

  const iconColors: Record<string, string> = {
    image: 'text-purple-500',
    video: 'text-red-500',
    audio: 'text-green-500',
    'file-pdf': 'text-red-600',
    'file-word': 'text-blue-600',
    'file-excel': 'text-green-600',
    'file-powerpoint': 'text-orange-600',
    'file-text': 'text-gray-600',
    file: 'text-gray-500',
  };

  const color = iconColors[iconName] || iconColors.file;

  return (
    <div className={`w-10 h-10 ${color} flex items-center justify-center`}>
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
  );
};

export default FileUpload;
