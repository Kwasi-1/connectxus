import apiClient from "../lib/apiClient";

export interface FileMetadata {
  file_id: string;
  url: string;
  type: "image" | "video" | "document" | "audio" | "other";
  size: number;
  extension: string;
  file_name: string;
  mime_type: string;
  uploaded_at: string;
  metadata?: Record<string, any>;
}

export interface UploadFileOptions {
  file: File;
  moduleType?: string;
  moduleId?: string;
  accessLevel?: "public" | "private" | "restricted";
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export interface GetFilesByModuleResponse {
  files: FileMetadata[];
  count: number;
}

/**
 * Upload a file to the server
 */
export const uploadFile = async (
  options: UploadFileOptions
): Promise<FileMetadata> => {
  const {
    file,
    moduleType,
    moduleId,
    accessLevel = "private",
    metadata,
    onProgress,
  } = options;

  const formData = new FormData();
  formData.append("file", file);

  if (moduleType) {
    formData.append("module_type", moduleType);
  }

  if (moduleId) {
    formData.append("module_id", moduleId);
  }

  formData.append("access_level", accessLevel);

  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  const config = onProgress
    ? {
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        },
      }
    : {};

  const response = await apiClient.post<FileMetadata>(
    "/v1/files/upload",
    formData,
    config
  );

  return response.data;
};

export const getFile = async (fileId: string): Promise<FileMetadata> => {
  const response = await apiClient.get<FileMetadata>(`/v1/files/${fileId}`);
  return response.data;
};

/**
 * Get files by module (e.g., all files for a specific post)
 */
export const getFilesByModule = async (
  moduleType: string,
  moduleId: string
): Promise<FileMetadata[]> => {
  const response = await apiClient.get<GetFilesByModuleResponse>(
    `/v1/files/module/${moduleType}/${moduleId}`
  );
  return response.data.files;
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  await apiClient.delete(`/v1/files/${fileId}`);
};

/**
 * Get download URL for a file (useful for forcing downloads)
 */
export const getDownloadUrl = (fileId: string): string => {
  return `${apiClient.defaults.baseURL}/v1/files/${fileId}/download`;
};
