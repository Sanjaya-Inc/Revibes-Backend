import { Bucket, File } from "@google-cloud/storage";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { TUploadFile } from "../../dto/file";

export enum BasePath {
  BANNER = "banners/",
  LOGISTIC = "logistics/",
  INVENTORY_ITEM = "inventory-items/",
  VOUCHER = "vouchers/",
  MISSION = "missions/",
}

export type UploadOptions = {
  public?: boolean;
};

export class FileStorage {
  private readonly storage: admin.storage.Storage;
  private readonly bucket: Bucket;
  private readonly signedUrlExpTime: number = 15 * 60 * 1000; // 15 minutes
  private static readonly _storageUrl =
    process.env.ENV === "local"
      ? "http://localhost:9199"
      : "https://storage.googleapis.com";
  private static readonly _firebaseStorageUrl =
    process.env.ENV === "local"
      ? "http://localhost:9199"
      : "https://firebasestorage.googleapis.com";

  constructor() {
    this.storage = admin.storage();
    this.bucket = this.storage.bucket();
  }

  public generateUri(baseName: BasePath, ...paths: string[]) {
    const clean = (str: string) => str.replace(/^\/+|\/+$/g, "");
    return [baseName, ...paths].map(clean).join("/");
  }

  public async getFullUrl(uri: string): Promise<string> {
    if (!uri) return "";

    let token: any = "";
    try {
      const file = this.bucket.file(uri);
      const [metadata] = await file.getMetadata();
      token = metadata?.metadata?.firebaseStorageDownloadTokens;
    } catch (err) {
      console.error("Failed to get file metadata");
    }

    const encodedPath = encodeURIComponent(uri);
    if (token) {
      return `${FileStorage._firebaseStorageUrl}/v0/b/${this.bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
    } else {
      // fallback: maybe it's public via makePublic()
      return `${FileStorage._storageUrl}/${this.bucket.name}/${encodedPath}?alt=media`;
    }
  }

  public async uploadFile(
    file: TUploadFile,
    opts: UploadOptions,
    baseName: BasePath,
    ...paths: string[]
  ): Promise<[string, File]> {
    const filePath = this.generateUri(baseName, ...paths);
    const uploadedFile = this.bucket.file(filePath);

    const metadata: any = {
      contentType: file.mimetype,
    };

    if (!opts?.public) {
      // Set token for Firebase-style public access
      metadata.metadata = {
        firebaseStorageDownloadTokens: uuidv4(),
      };
    }

    await uploadedFile.save(file.buffer, { metadata });

    if (opts?.public) {
      // Optional: make GCS-style public (not needed if using token-based access)
      await uploadedFile.makePublic();
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
      contentType,
      // CRITICAL: Include x-goog-acl in extensionHeaders when generating the URL
      extensionHeaders: {
        "x-goog-acl": "public-read", // This header is now "signed" into the URL
      },
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

  public async makeFilePublic(uri: string): Promise<void> {
    const file = this.bucket.file(uri);
    await file.makePublic();
  }
}

// Singleton
let fileStorageInstance: FileStorage | null = null;

export function getFileStorageInstance(): FileStorage {
  fileStorageInstance ??= new FileStorage();
  return fileStorageInstance;
}

export default FileStorage;
