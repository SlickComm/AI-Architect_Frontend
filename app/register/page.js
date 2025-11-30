"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import PocketBase from 'pocketbase';
const pb = new PocketBase('https://pocketbase-ygoo0ow0kskcco8cks84w4ws.cad-ch.at');


export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
        const data = {
            "email": email,
            "emailVisibility": true,
            "name": "test",
            "password": password,
            "passwordConfirm": password
        };

        const userCredential = await pb.collection('users').create(data);

      console.log("Erfolgreich registriert:", userCredential.user);
      router.push("/");
    } catch (error) {
      console.error("Fehler bei Registrierung:", error);
      alert(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-title">Registrieren</h1>
        
        <form onSubmit={handleRegister}>
          <div className="register-formGroup">
            <label className="register-label">E-Mail</label>
            <input
              type="email"
              className="register-input"
              placeholder="dein.email@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-formGroup">
            <label className="register-label">Passwort</label>
            <input
              type="password"
              className="register-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-button">
            Registrieren
          </button>
        </form>

        <p className="register-textInfo">
          Bereits einen Account?{" "}
          <a href="/login" className="register-link">
            Anmelden
          </a>
        </p>
      </div>
    </div>
  );
}
