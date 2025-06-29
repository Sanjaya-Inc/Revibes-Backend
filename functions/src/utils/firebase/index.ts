import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Or use a service account
    storageBucket: "revibes-d77f0.firebasestorage.app",
  });
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
