"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from 'next/image'
import Script from 'next/script';

import { Viewer } from "three-dxf";
import DxfParser from "dxf-parser";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import SlickCommLogo from "../app/SlickCommLogo_100_blue.png";

// Importiere dein Tailwind-CSS
import "./Home.css";

export default function Home() {
  const [lvText, setLvText] = useState("");
  const [downloadFilename, setDownloadFilename] = useState(null);
  const [lastMessage, setLastMessage] = useState("");

  const viewerContainerRef = useRef(null);
  const viewerInstanceRef = useRef(null);

  async function chatWithGptAndMaybeGenerate(text) {
    if (!text) {
      console.log("Bitte LV-Text eingeben!");
      return;
    }
    try {
      const resp = await fetch("http://188.68.54.146:8050/chat-with-gpt/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await resp.json();

      if (data.status === "ok") {
        setLastMessage(`Thema erkannt (Baugraben/Rohr/ Durchstich). DXF wird generiert... - ${lvText}`);
        generateDXF(text);
      }
      else if (data.status === "limitation") {
        setLastMessage(data.message);
      }
      else {
        setLastMessage("Unbekannte Antwort vom Server / ChatGPT.");
      }
    } catch (error) {
      console.error("Fehler bei chatWithGptAndMaybeGenerate:", error);
      setLastMessage("Fehler bei der Kommunikation mit dem Backend.");
    }
  }

  async function generateDXF(text) {
    if (!text) {
      console.log("Bitte LV-Text eingeben!");
      return;
    }

    try {
      const resp = await fetch("http://188.68.54.146:8050/generate-dxf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lv_text: text }),
      });
      const data = await resp.json();
      if (data.filename) {
        setDownloadFilename(data.filename);
        console.log("DXF erfolgreich generiert!");
      } else {
        alert("Fehler: " + data.message);
      }
    } catch (error) {
      console.error("Fehler beim Generieren der DXF:", error);
      alert("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    }
  }

  async function renderDXF(filename) {
    if (!filename) {
      // Keine Datei => Canvas leeren
      if (viewerContainerRef.current) {
        viewerContainerRef.current.innerHTML = "";
      }
      return;
    }

    try {
      const fileResp = await fetch(`http://188.68.54.146:8050/download-dxf/${filename}`);
      const arrayBuffer = await fileResp.arrayBuffer();

      const dxfText = new TextDecoder("utf-8").decode(arrayBuffer);
      const parser = new DxfParser();
      const dxfParsed = parser.parseSync(dxfText);

      const container = viewerContainerRef.current;
      if (!container) return;

      // Vorheriges Canvas entfernen
      container.innerHTML = "";

      // "Viewer" von three-dxf
      const viewer = new Viewer(
        dxfParsed,
        container,
        container.clientWidth,
        container.clientHeight,
        "#222222",
        THREE
      );
      // Standard-Kamera & Szene aus dem Viewer holen
      const { camera, scene, renderer } = viewer;

      // ~~~~~ ORBIT CONTROLS ~~~~~
      // Wir ersetzen oder modifizieren den Default, damit wir Pan + Zoom haben, aber KEINE Rotation
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableRotate = false;
      controls.enablePan = true;
      controls.enableZoom = true;

      // Falls du statt SHIFT+LMB direktes Panning willst:
      controls.mouseButtons.LEFT = THREE.MOUSE.PAN;

      // Render-Loop anstoßen (OrbitControls arbeitet intern)
      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // Speichern für später
      viewerInstanceRef.current = viewer;
    } catch (err) {
      console.error("Fehler beim Rendern der DXF:", err);
    }
  }

  function handleDownloadClick() {
    if (!downloadFilename) return;
    window.open(`http://188.68.54.146:8050/download-dxf/${downloadFilename}`, "_blank");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      // Ruft chat-with-gpt => bei Erfolg => generateDXF
      chatWithGptAndMaybeGenerate(lvText);
      setLvText(""); // optional: Input leeren
    }
  }

  useEffect(() => {
    if (downloadFilename) {
      renderDXF(downloadFilename);
    }
  }, [downloadFilename]);

  return (
    <div className="home-container">
      {/* Preview-Bereich oben */}
      <div className="home-preview">
        {!downloadFilename ? (
          <div className="home-initialScreen">
            <Image
              src={SlickCommLogo}
              alt="SlickComm Logo"
              width={100}
              height={100}
              className="home-initialLogo"
            />
            <h1 className="home-initialTitle">SlickComm</h1>
            <p className="home-subtitle">Create technical drawings in no time</p>
          </div>
        ) : (
          // Sobald downloadFilename existiert => Canvas
          <div ref={viewerContainerRef} className="home-viewer" />
        )}
      </div>

      {lastMessage && (
        <div className="home-chatBubble">
          {lastMessage}
        </div>
      )}

      {/* Eingabe unten */}
      <div className="home-inputContainer">
        <div className="home-action">
          <input
            type="text"
            className="home-input"
            placeholder="LV-Position eingeben... (Enter zum Generieren)"
            value={lvText}
            onChange={(e) => setLvText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Button nur anzeigen, wenn downloadFilename vorhanden */}
          {downloadFilename && (
            <button
              className="home-download"
              onClick={handleDownloadClick}
            >
              Download
            </button>
          )}
        </div>
        <p className="home-hint">*Das KI-Modell ist limitiert auf die Erzeugung von Baugräben, Rohren und Durchstiche.</p>
      </div>
    </div>
  );
}
