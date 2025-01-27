import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseApi = process.env.NEXT_PUBLIC_API_FIREBASE;

const firebaseConfig = {
  apiKey: firebaseApi,
  authDomain: "cad-chat-ce08e.firebaseapp.com",
  projectId: "cad-chat-ce08e",
  storageBucket: "cad-chat-ce08e.firebasestorage.app",
  messagingSenderId: "884119851803",
  appId: "1:884119851803:web:5d6b82dcecd5f48998b9be",
  measurementId: "G-4HE2Y3TD96"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);