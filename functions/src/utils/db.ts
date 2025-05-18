import * as admin from 'firebase-admin';

if (!admin.apps.length) { // Check if already initialized
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Or use a service account
  });
}

export const db = admin.firestore(); // Get a Firestore instance

export default db;