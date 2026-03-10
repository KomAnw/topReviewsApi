export type FileResourceType = "other";

export interface FileUploadParams {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  resourceType: FileResourceType;
  tenantId?: string;
}

export interface FileStorage {
  upload(params: FileUploadParams): Promise<string>;
}

export const FILE_STORAGE = "FileStorage";
