export interface UploadedFileResult {
  key: string;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface IFileStorage {
  uploadChatFile(file: Express.Multer.File): Promise<UploadedFileResult>;
}
