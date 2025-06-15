import { Bucket, File } from "@google-cloud/storage";
import admin from "firebase-admin";
import { TUploadFile } from "./dto/file";

export enum BasePath {
  BANNER = "banners/",
}

export type UploadOptions = {
  public?: boolean;
};

export class FileStorage {
  private readonly storage: admin.storage.Storage;
  private readonly bucket: Bucket;

  private static readonly _storageUrl = "https://storage.googleapis.com";

  constructor() {
    this.storage = admin.storage();
    this.bucket = this.storage.bucket();
  }

  public generateUri(baseName: BasePath, ...paths: string[]) {
    return [baseName, ...paths].join("/");
  }

  public getFullUrl(uri: string) {
    if (!uri) return "";
    // Assuming files are stored at the root of the bucket
    return `${FileStorage._storageUrl}/${this.bucket.name}/${uri}`;
  }

  public async uploadFile(
    file: TUploadFile,
    opts: UploadOptions,
    baseName: BasePath,
    ...paths: string[]
  ): Promise<[string, File]> {
    const filePath = this.generateUri(baseName, ...paths);
    const uploadedFile = this.bucket.file(filePath);

    await uploadedFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    if (opts?.public) {
      uploadedFile.makePublic();
    }

    return [filePath, uploadedFile];
  }

  public async removeFile(uri: string) {
    const file = this.bucket.file(uri);
    return file.delete();
  }
}

let fileStorageInstance: FileStorage | null = null;

export function getFileStorageInstance(): FileStorage {
  fileStorageInstance ??= new FileStorage();
  return fileStorageInstance;
}

export default FileStorage;
