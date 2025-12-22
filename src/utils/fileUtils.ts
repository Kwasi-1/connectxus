/**
 * File utility functions for handling file uploads and validation
 */

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FilePickerOptions extends FileValidationOptions {
  multiple?: boolean;
  accept?: string;
}

export const validateFile = (
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } => {
  const { maxSizeMB = 10, allowedTypes, allowedExtensions } = options;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File exceeds the maximum upload limit of ${maxSizeMB} MB`,
    };
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const isTypeAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(`${category}/`);
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }
  }

  if (allowedExtensions && allowedExtensions.length > 0) {
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(fileExt)) {
      return {
        valid: false,
        error: `File extension ${fileExt} is not allowed`,
      };
    }
  }

  return { valid: true };
};

/**
 * Open file picker dialog
 */
export const selectFile = async (
  options: FilePickerOptions = {}
): Promise<File | File[] | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.multiple || false;

    if (options.accept) {
      input.accept = options.accept;
    } else if (options.allowedTypes) {
      input.accept = options.allowedTypes.join(',');
    }

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) {
        resolve(null);
        return;
      }

      const files = Array.from(target.files);

      for (const file of files) {
        const validation = validateFile(file, options);
        if (!validation.valid) {
          alert(validation.error);
          resolve(null);
          return;
        }
      }

      resolve(options.multiple ? files : files[0]);
    };

    input.click();
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Determine file category from MIME type
 */
export const getFileCategory = (
  mimeType: string
): 'image' | 'video' | 'document' | 'audio' | 'other' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';

  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/rtf',
  ];

  if (documentTypes.includes(mimeType)) return 'document';

  return 'other';
};

/**
 * Get icon name for file type (for use with icon libraries)
 */
export const getFileIcon = (mimeType: string): string => {
  const category = getFileCategory(mimeType);

  switch (category) {
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'audio':
      return 'audio';
    case 'document':
      if (mimeType === 'application/pdf') return 'file-pdf';
      if (mimeType.includes('word')) return 'file-word';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'file-excel';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
        return 'file-powerpoint';
      return 'file-text';
    default:
      return 'file';
  }
};

/**
 * Create object URL for file preview
 */
export const createFilePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeFilePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',

  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/webm',

  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',

  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/rtf',

  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.bmp',
  '.tiff',

  '.mp4',
  '.mpeg',
  '.mov',
  '.avi',
  '.wmv',
  '.webm',

  '.mp3',
  '.wav',
  '.ogg',
  '.aac',

  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.rtf',

  '.zip',
  '.rar',
  '.7z',
];
