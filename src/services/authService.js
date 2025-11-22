// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore' // Adicionado updateDoc
import { auth, db } from 'boot/firebase'

export const authService = {
  // Registar novo utilizador
  async register(name, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Atualizar o nome do utilizador
      await updateProfile(user, { displayName: name })

      // Criar documento do utilizador no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: name,
        email: email,
        totalPoints: 0,
        achievements: [],
        createdAt: new Date().toISOString(),
        level: 1,
      })

      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Fazer login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      let message = 'Erro ao fazer login'
      if (error.code === 'auth/user-not-found') {
        message = 'Utilizador não encontrado'
      } else if (error.code === 'auth/wrong-password') {
        message = 'Password incorreta'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido'
      }
      return { success: false, error: message }
    }
  },

  // Fazer logout
  async logout() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Recuperar password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obter dados do utilizador
  async getUserData(uid) {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() }
      } else {
        return { success: false, error: 'Utilizador não encontrado' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obter utilizador atual
  getCurrentUser() {
    return auth.currentUser
  },

  // Atualizar dados do utilizador (NOVA FUNÇÃO)
  async updateUser(uid, data) {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, data)

      // Se o nome foi alterado, atualiza também no Firebase Auth
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name })
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error)
      return { success: false, error: error.message }
    }
  },
}
