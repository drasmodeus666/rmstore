import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClHQZK--6dCjp_rk_dwKA_JN1tv6EyO4g",
  authDomain: "statement-3b2ec.firebaseapp.com",
  databaseURL: "https://statement-3b2ec-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "statement-3b2ec",
  storageBucket: "statement-3b2ec.appspot.com",
  messagingSenderId: "742227178224",
  appId: "1:742227178224:web:db650c6788e8fea76c8835",
}

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const database = getDatabase(app)

export default app
