import { Bucket, File } from "@google-cloud/storage";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { TUploadFile } from "../../dto/file";
import { withTimeout } from "../withTimeout";

export enum BasePath {
  BANNER = "banners/",
  LOGISTIC = "logistics/",
  INVENTORY_ITEM = "inventory-items/",
  VOUCHER = "vouchers/",
  MISSION = "missions/",
}

const FILE_EXISTS_TIMEOUT_MS = 5_000;

export type UploadOptions = {
  public?: boolean;
};

export class FileStorage {
  private readonly storage: admin.storage.Storage;
  private readonly bucket: Bucket;
  private readonly signedUrlExpTime: number = 15 * 60 * 1000;
  private readonly signedReadUrlExpTime: number = 24 * 60 * 60 * 1000;
  private get isEmulator(): boolean {
    return (
      Boolean(
        process.env.STORAGE_EMULATOR_HOST ||
          process.env.FIREBASE_STORAGE_EMULATOR_HOST,
      ) ||
      (process.env.FUNCTIONS_EMULATOR === "true" && process.env.ENV === "local")
    );
  }

  private get storageUrl(): string {
    if (this.isEmulator) {
      const emulatorHost =
        process.env.STORAGE_EMULATOR_HOST ||
        process.env.FIREBASE_STORAGE_EMULATOR_HOST;
      if (emulatorHost) {
        return emulatorHost.startsWith("http")
          ? emulatorHost
          : `http://${emulatorHost}`;
      }
      return "http://localhost:9199";
    }
    return "https://storage.googleapis.com";
  }

  private get firebaseStorageUrl(): string {
    if (this.isEmulator) {
      const emulatorHost =
        process.env.STORAGE_EMULATOR_HOST ||
        process.env.FIREBASE_STORAGE_EMULATOR_HOST;
      if (emulatorHost) {
        return emulatorHost.startsWith("http")
          ? emulatorHost
          : `http://${emulatorHost}`;
      }
      return "http://localhost:9199";
    }
    return "https://firebasestorage.googleapis.com";
  }

  constructor() {
    this.storage = admin.storage();
    this.bucket = this.storage.bucket();
  }

  public generateUri(baseName: BasePath, ...paths: string[]) {
    const clean = (str: string) => str.replace(/^\/+|\/+$/g, "");
    return [baseName, ...paths].map(clean).join("/");
  }

  public objectMediaUrl(uri: string): string {
    if (!uri) return "";
    const encodedPath = encodeURIComponent(uri);
    return `${this.storageUrl}/${this.bucket.name}/${encodedPath}?alt=media`;
  }

  public async getFullUrl(uri: string): Promise<string> {
    if (!uri) {
      console.warn("[OrderImage] getFullUrl empty uri");
      return "";
    }

    try {
      const file = this.bucket.file(uri);
      const [metadata] = await withTimeout(
        file.getMetadata(),
        FILE_EXISTS_TIMEOUT_MS,
      );
      const token = metadata?.metadata?.firebaseStorageDownloadTokens;
      const encodedPath = encodeURIComponent(uri);
      if (token) {
        const url = `${this.firebaseStorageUrl}/v0/b/${this.bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
        console.log("[OrderImage] getFullUrl", { uri, kind: "firebase-token" });
        return url;
      }

      const [signed] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + this.signedReadUrlExpTime,
      });
      console.log("[OrderImage] getFullUrl", { uri, kind: "signed-read" });
      return signed;
    } catch (error) {
      const fallback = this.objectMediaUrl(uri);
      console.error("[OrderImage] getFullUrl fallback", {
        uri,
        error: String(error),
        fallback,
      });
      return fallback;
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
    try {
      const file = this.bucket.file(uri);
      const [exists] = await withTimeout(file.exists(), FILE_EXISTS_TIMEOUT_MS);
      return exists;
    } catch {
      return false;
    }
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
