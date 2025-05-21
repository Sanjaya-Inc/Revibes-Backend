import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, Auth, signInWithCustomToken, sendEmailVerification, User } from "firebase/auth";
import * as admin from 'firebase-admin';

export class FirebaseClient {
  firebase: FirebaseApp;
  auth: Auth;
  uid: string;
  user?: User;

  constructor(uid: string) {
    this.firebase = initializeApp({
      apiKey: "AIzaSyCF2ai2KkgR32nYVD5McNEO3bp8gny1DD8",
      authDomain: "revibes-d77f0.firebaseapp.com",
      projectId: "revibes-d77f0",
      storageBucket: "revibes-d77f0.appspot.com",
      appId: "1:642097244686:android:c374e391f46ef190c3aa5f",
    });
    this.auth = getAuth(this.firebase);
    this.uid = uid;
  }

  public async signIn() {
    const token = await admin.auth().createCustomToken(this.uid);
    const creds = await signInWithCustomToken(this.auth, token);
    this.user = creds.user;
  }

  public async sendEmailVerification() {
    if (!this.user) {
      return;
    }
    await sendEmailVerification(this.user);
  }

  public async signOut() {
    this.auth.signOut();
  }
}

export default FirebaseClient;