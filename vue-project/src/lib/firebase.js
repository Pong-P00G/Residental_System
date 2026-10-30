import { getApps, initializeApp } from 'firebase/app'
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  linkWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  unlink,
  updateProfile,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId)

const app = firebaseConfigured ? getApps()[0] || initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null

const authMessages = {
  'auth/invalid-credential': 'That email and password do not match an account.',
  'auth/invalid-login-credentials': 'That email and password do not match an account.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-not-found': 'No account uses that email address.',
  'auth/wrong-password': 'That password is not correct.',
  'auth/email-already-in-use': 'An account already uses that email address. Sign in instead.',
  'auth/weak-password': 'Choose a password with at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment before trying again.',
  'auth/network-request-failed': 'No connection to the sign-in service. Check your network and try again.',
  'auth/operation-not-allowed': 'Email and password sign-in is not enabled for this project yet.',
  'auth/missing-email': 'Enter the email on your tenancy record.',
  'auth/popup-closed-by-user': 'Sign-in window closed before finishing.',
  'auth/cancelled-popup-request': 'Another sign-in window is already open.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups and try again.',
  'auth/account-exists-with-different-credential':
    'An account already uses that email with a different sign-in method. Sign in that way, then connect this provider from Profile.',
  'auth/provider-already-linked': 'That sign-in method is already connected to this account.',
  'auth/credential-already-in-use': 'That sign-in account already belongs to another profile.',
  'auth/no-such-provider': 'That sign-in method is not connected to this account.',
  'auth/requires-recent-login': 'For security, sign in again before changing linked accounts.',
  'auth/operation-not-supported-in-this-environment': 'This sign-in method needs a secure browser context.',
  'auth/api-key-not-valid': 'Firebase rejected this build\'s API key. Check VITE_FIREBASE_API_KEY in .env.',
  'auth/invalid-api-key': 'Firebase rejected this build\'s API key. Check VITE_FIREBASE_API_KEY in .env.',
}

export function authErrorMessage(error) {
  if (!firebaseConfigured) return 'Sign-in is not configured for this build. Use the demo access options instead.'
  return authMessages[error?.code] || error?.message || 'Something went wrong. Try again.'
}

export {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  linkWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  unlink,
  updateProfile,
}
