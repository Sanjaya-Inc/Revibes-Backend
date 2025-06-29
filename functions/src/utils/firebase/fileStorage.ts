import { Bucket, File } from "@google-cloud/storage";
import admin from "firebase-admin";
import { TUploadFile } from "../../dto/file";

export enum BasePath {
  BANNER = "banners/",
  LOGISTIC = "logistics/",
}

export type UploadOptions = {
  public?: boolean;
};

export class FileStorage {
  private readonly storage: admin.storage.Storage;
  private readonly bucket: Bucket;
  private readonly signedUrlExpTime: number = 15 * 60 * 1000; // URL expires in 15 minutes

  private static readonly _storageUrl = "https://storage.googleapis.com";

  constructor() {
    this.storage = admin.storage();
    this.bucket = this.storage.bucket();
  }

  public generateUri(baseName: BasePath, ...paths: string[]) {
    const clean = (str: string) => str.replace(/^\/+|\/+$/g, "");
    return [baseName, ...paths].map(clean).join("/");
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

  public async getSignedUrl(
    contentType: string,
    baseName: BasePath,
    ...paths: string[]
  ): Promise<[string, string, number]> {
    const downloadUri = this.generateUri(baseName, ...paths);
    const file = this.bucket.file(downloadUri);
    const exp = Date.now() + this.signedUrlExpTime;

    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: exp,
      contentType: contentType,
    });
    return [uploadUrl, downloadUri, exp];
  }

  public async removeFile(uri: string) {
    const file = this.bucket.file(uri);
    return file.delete();
  }

  public async removeFolder(
    baseName: BasePath,
    ...paths: string[]
  ): Promise<void> {
    const prefix = this.generateUri(baseName, ...paths);

    const [files] = await this.bucket.getFiles({ prefix });
    if (files.length === 0) return;
    await Promise.all(files.map((file) => file.delete()));
  }

  public async fileExists(uri: string): Promise<boolean> {
    const file = this.bucket.file(uri);
    const [exists] = await file.exists();
    return exists;
  }
}

let fileStorageInstance: FileStorage | null = null;

export function getFileStorageInstance(): FileStorage {
  fileStorageInstance ??= new FileStorage();
  return fileStorageInstance;
}

export default FileStorage;
