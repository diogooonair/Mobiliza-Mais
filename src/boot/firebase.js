// src/boot/firebase.js
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth' // <--- NOVO
import { getFirestore } from 'firebase/firestore' // <--- NOVO

const firebaseConfig = {
  apiKey: 'AIzaSyA6EkcI2pHsnIDdTIGMKCwlIDGMTl6hSw4',
  authDomain: 'mobiliza-mais-15b4f.firebaseapp.com',
  projectId: 'mobiliza-mais-15b4f',
  storageBucket: 'mobiliza-mais-15b4f.firebasestorage.app',
  messagingSenderId: '273586265012',
  appId: '1:273586265012:web:5e8f42bd9df055a3b9b0e1',
  measurementId: 'G-KK9E14PNB9',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Exportar os serviços para usar no resto da app
export const auth = getAuth(app) // <--- ADICIONADO
export const db = getFirestore(app) // <--- ADICIONADO
export const analytics = getAnalytics(app)
