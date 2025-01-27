"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import "../Home.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Submit-Handler fürs Login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Eingeloggt:", userCredential.user);

      router.push("/");
    } catch (error) {
      console.error("Fehler beim Login:", error);
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        
        <form onSubmit={handleLogin}>
          <div className="login-formGroup">
            <label className="login-label">E-Mail</label>
            <input
              type="email"
              className="login-input"
              placeholder="dein.email@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-formGroup">
            <label className="login-label">Passwort</label>
            <input
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
          >
            Anmelden
          </button>
        </form>

        <p className="login-textInfo">
          Noch kein Account?{" "}
          <a href="/register" className="login-link">
            Registrieren
          </a>
        </p>
      </div>
    </div>
  );
}
