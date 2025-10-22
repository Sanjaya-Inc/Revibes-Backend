import * as admin from "firebase-admin";

const firebaseMetadata =
  process.env.FIREBASE_CONFIG !== undefined
    ? JSON.parse(process.env.FIREBASE_CONFIG)
    : {};

const projectId =
  process.env.APP_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  process.env.GCP_PROJECT ||
  firebaseMetadata.projectId;

const storageBucket =
  process.env.APP_STORAGE_BUCKET || firebaseMetadata.storageBucket;

if (!admin.apps.length) {
  const options: admin.AppOptions = {
    credential: admin.credential.applicationDefault(), // Or use a service account
  };

  if (projectId) {
    options.projectId = projectId;
  }

  if (storageBucket) {
    options.storageBucket = storageBucket;
  }

  admin.initializeApp(options);
}

export function generateId(): string {
  return admin.firestore().collection("_").doc().id;
}

export const db = admin.firestore();

export const auth = admin.auth();

export const storage = admin.storage();

export const bucket = storage.bucket();

export const messaging = admin.messaging();

export * from "./fileStorage";
