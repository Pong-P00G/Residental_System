import { defineStore } from 'pinia'
import {
  auth,
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  linkWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  unlink,
  updateProfile,
} from '../lib/firebase'
import { useAppStore } from './app'
import { api } from '../lib/api'

function describeUser(user) {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    providers: (user.providerData || []).map((provider) => provider.providerId),
  }
}

function providerFor(name) {
  return name === 'facebook' ? new FacebookAuthProvider() : new GoogleAuthProvider()
}

const providerLabel = (name) => (name === 'facebook' ? 'Facebook' : 'Google')

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ready: false,
    user: null,
    // Identity and permissions resolved by the API for this Firebase session.
    serverUser: null,
    permissions: null,
  }),
  getters: {
    isSignedIn: (state) => Boolean(state.user),
    providers: (state) => state.user?.providers || [],
    email: (state) => state.user?.email || '',
  },
  actions: {
    async initAuth() {
      if (!auth) {
        this.ready = true
        return Promise.resolve()
      }
      return new Promise((resolve) => {
        let settled = false
        const done = () => {
          this.ready = true
          if (!settled) {
            settled = true
            resolve()
          }
        }
        onAuthStateChanged(
          auth,
          (user) => {
            this.user = describeUser(user)
            const app = useAppStore()
            if (user && !app.signedIn) this.openSession(user)
            // Exchange the Firebase session for the API user without blocking mount.
            if (user) this.syncServerSession(user)
            done()
          },
          () => done(),
        )
      })
    },
    openSession(user) {
      const app = useAppStore()
      const name = user.displayName || (user.email || '').split('@')[0] || app.profile.name
      app.applyAuthSession({ name, email: user.email || '' })
      this.user = describeUser(user)
    },
    async signInWithEmail(email, password) {
      if (!auth) throw new Error('Authentication is not configured.')
      const credential = await signInWithEmailAndPassword(auth, email, password)
      this.openSession(credential.user)
      this.syncServerSession(credential.user)
      useAppStore().toast('Signed in')
      return credential.user
    },
    async registerAccount({ name, email, password }) {
      if (!auth) throw new Error('Authentication is not configured.')
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      if (name) await updateProfile(credential.user, { displayName: name })
      this.openSession(auth.currentUser || credential.user)
      this.syncServerSession(auth.currentUser || credential.user)
      useAppStore().toast('Account created · welcome home')
      return credential.user
    },
    async signInWithProvider(name) {
      if (!auth) throw new Error('Authentication is not configured.')
      const provider = providerFor(name)
      if (name !== 'facebook') provider.setCustomParameters({ prompt: 'select_account' })
      const credential = await signInWithPopup(auth, provider)
      this.openSession(credential.user)
      this.syncServerSession(credential.user)
      useAppStore().toast(`Signed in with ${providerLabel(name)}`)
      return credential.user
    },
    async linkProvider(name) {
      if (!auth?.currentUser) throw new Error('Sign in with an account before connecting another sign-in method.')
      const credential = await linkWithPopup(auth.currentUser, providerFor(name))
      this.user = describeUser(credential.user)
      useAppStore().toast(`${providerLabel(name)} connected · you can now sign in with it`)
      return credential.user
    },
    async unlinkProvider(providerId) {
      if (!auth?.currentUser) throw new Error('Sign in with an account before changing linked sign-in methods.')
      await unlink(auth.currentUser, providerId)
      this.user = describeUser(auth.currentUser)
      useAppStore().toast('Sign-in method disconnected')
    },
    async reauthenticateWithPassword(password) {
      const user = auth?.currentUser
      if (!user?.email) throw new Error('There is no email and password to confirm with.')
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
      this.user = describeUser(auth.currentUser)
      useAppStore().toast('Identity confirmed')
    },
    async reauthenticateWithProvider(name) {
      if (!auth?.currentUser) throw new Error('Sign in again to refresh your session.')
      await reauthenticateWithPopup(auth.currentUser, providerFor(name))
      this.user = describeUser(auth.currentUser)
      useAppStore().toast('Identity confirmed')
    },
    async requestPasswordReset(email) {
      if (!auth) throw new Error('Authentication is not configured.')
      await sendPasswordResetEmail(auth, email)
      useAppStore().toast('Reset link sent · check your inbox')
    },
    // Adopt the API's user + permissions, falling back to the demo session when
    // the backend is unreachable or unconfigured.
    async syncServerSession(firebaseUser) {
      if (!firebaseUser) return null

      try {
        const session = await api.auth.createSession()
        this.serverUser = session?.user ?? null
        this.permissions = session?.permissions ?? null

        if (this.serverUser) {
          useAppStore().applyServerUser({
            role: this.serverUser.role,
            name: this.serverUser.name,
            email: this.serverUser.email,
          })
        }

        return session
      } catch {
        // Offline, backend down, or Firebase Admin not configured.
        return null
      }
    },
    async endServerSession() {
      try {
        await api.auth.logout()
      } catch {
        // Best effort: sign-out must never be blocked by the API.
      }
      this.serverUser = null
      this.permissions = null
    },
    async signOut() {
      if (auth?.currentUser) {
        await this.endServerSession()
        try {
          await firebaseSignOut(auth)
        } catch {
          // The local session is still cleared below.
        }
      }
      this.user = null
      useAppStore().signOut()
    },
  },
})
