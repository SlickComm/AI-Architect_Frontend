"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image'

import { Viewer } from "three-dxf";
import DxfParser from "dxf-parser";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import ChatCADLogo from "../app/Logo_ChatCAD.png";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import "./Home.css";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sessionId, setSessionId] = useState("");
  const [elementDescription, setElementDescription] = useState("");

  const [dxfBuffer, setDxfBuffer] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState("");

  const [gptAnswer, setGptAnswer] = useState("");

  const [mapping,   setMapping]   = useState([]);
  const [pdfBuffer, setPdfBuffer] = useState(null);

  const viewerContainerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      handleStartSession();
    }
  }, [isAuthenticated]);

  // --------------------------
  // 2) Neu rendern, wenn dxfBuffer / downloadFilename sich ändern
  // --------------------------
  useEffect(() => {
    if (downloadFilename && dxfBuffer && viewerContainerRef.current) {
      renderDXF(dxfBuffer);
    }
  }, [downloadFilename, dxfBuffer]);

  // --------------------------
  // Start Session
  // --------------------------
  async function handleStartSession() {
    try {
      const resp = await fetch(`${baseUrl}/start-session/`, {
        method: "POST",
      });

      const data = await resp.json();
      setSessionId(data.session_id);

      console.log("Session gestartet:", data.session_id);
    } catch (err) {
      console.error("Fehler bei start-session:", err);
    }
  }

  // --------------------------
  // Add Element
  // --------------------------
  async function handleAddElement() {
    if (!sessionId) {
      alert("Keine Session vorhanden.");
      return;
    }

    if (!elementDescription) {
      alert("Bitte eine Beschreibung eingeben (z.B. 'Baugraben l=12.35 b=0.98 t=1.35').");
      return;
    }

    try {
      const resp = await fetch(`${baseUrl}/add-element/?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: elementDescription }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        setGptAnswer(data.answer);
        console.log("Aktualisiertes JSON:", data.updated_json);
      } else {
        console.error("Fehler bei add-element:", data);
        alert("Fehler bei add-element");
      }
    } catch (err) {
      console.error("Fehler bei add-element:", err);
    }
  }

  // --------------------------
  // Generate DXF
  // --------------------------
  async function handleGenerateDxf() {
    if (!sessionId) {
      alert("Keine Session vorhanden.");
      return;
    }

    try {
      const resp = await fetch(`${baseUrl}/generate-dxf-by-session/?session_id=${sessionId}`, {
        method: "POST",
      });
      if (!resp.ok) {
        alert("Fehler beim Generieren der DXF");
        return;
      }

      const arrayBuffer = await resp.arrayBuffer();
      const filename = "myDrawing.dxf";

      setDxfBuffer(arrayBuffer);
      setDownloadFilename(filename);

    } catch (err) {
      console.error("Fehler bei generate-dxf:", err);
    }
  }

  // --------------------------
  // Download der DXF-Datei
  // --------------------------
  function handleDownloadClick() {
    if (!dxfBuffer) return;

    // Blob erstellen
    const blob = new Blob([dxfBuffer], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);

    // Link + Klick
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // --------------------------
  // DXF rendern (three-dxf)
  // --------------------------
  async function renderDXF(arrayBuffer) {
    try {
      const dxfText = new TextDecoder("utf-8").decode(arrayBuffer);
      const parser = new DxfParser();
      const dxfParsed = parser.parseSync(dxfText);

      const container = viewerContainerRef.current;
      if (!container) return;

      // Vorheriges Canvas leeren
      container.innerHTML = "";

      const viewer = new Viewer(
        dxfParsed,
        container,
        container.clientWidth,
        container.clientHeight,
        "#333333",
        THREE
      );
      const { camera, scene, renderer } = viewer;

      // OrbitControls aktivieren
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableRotate = false;
      controls.enablePan = true;
      controls.enableZoom = true;

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    } catch (err) {
      console.error("Fehler beim Rendern des DXF:", err);
    }
  }

  // --------------------------
  // Edit Element
  // --------------------------
  async function handleEditElement() {
    if (!sessionId) {
      alert("Keine Session vorhanden.");
      return;
    }
  
    if (!elementDescription) {
      alert("Bitte Beschreibungs-Text eingeben (z.B. 'Ändere Baugraben auf length=12.5').");
      return;
    }
  
    try {
      const resp = await fetch(`${baseUrl}/edit-element/?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: elementDescription }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        setGptAnswer(data.answer);
        console.log("Aktualisiertes JSON nach Edit:", data.updated_json);
      } else {
        console.error("Fehler bei edit-element:", data);
        alert("Fehler bei edit-element");
      }
    } catch (err) {
      console.error("Fehler bei edit-element:", err);
    }
  }  

  // --------------------------
  // Delete Element
  // --------------------------
  async function handleRemoveElement() {
    if (!sessionId) {
      alert("Keine Session vorhanden.");
      return;
    }
  
    if (!elementDescription) {
      alert("Bitte Beschreibungs-Text eingeben (z.B. 'Lösche das Rohr').");
      return;
    }
  
    try {
      const resp = await fetch(`${baseUrl}/remove-element/?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: elementDescription }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        setGptAnswer(data.answer);
        console.log("Aktualisiertes JSON nach Remove:", data.updated_json);
      } else {
        console.error("Fehler bei remove-element:", data);
        alert("Fehler bei remove-element");
      }
    } catch (err) {
      console.error("Fehler bei remove-element:", err);
    }
  }
  
  async function handleMatchLv() {
    const resp = await fetch(`${baseUrl}/match-lv/`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ session_id: sessionId }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("match-lv Error:", txt);
      alert("match-lv Error: " + txt);
      return;
    }

    const data = await resp.json();
    console.log("«/match-lv» Response", data);
    setMapping(data.mapping ?? []);
  }

  function handleDownloadPdf() {
    if (!pdfBuffer) return;

    const url  = URL.createObjectURL(pdfBuffer);
    const link = document.createElement("a");
    link.href        = url;
    link.download    = "Rechnung.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleGenerateInvoice() {
    const payload = {
      session_id: sessionId,
      mapping: mapping.map(r => ({
        aufmass : r.aufmass,
        qty     : r.qty,      
        L       : r.L,
        B       : r.B,
        T       : r.T,
        match   : r.match        
      }))
    };


    console.log("Invoice-Payload ➜", payload);

    const resp = await fetch(`${baseUrl}/invoice/`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    });

    const blob = await resp.blob();
    setPdfBuffer(blob);
  }

  // --------------------------
  // onKeyDown → ENTER
  // --------------------------
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const descLower = elementDescription.toLowerCase();

      if (descLower.includes("lösche") || descLower.includes("remove") || descLower.includes("delete")) {
        handleRemoveElement().then(() => handleGenerateDxf());
      }
      else if (descLower.includes("ändere") || descLower.includes("update") || descLower.includes("edit")) {
        handleEditElement().then(() => handleGenerateDxf());
      }
      else {
        handleAddElement().then(() => handleGenerateDxf());
      }

      setElementDescription("");
    }
  }

  if (loading) {
    return (
      <div className="home-container flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Weiterleitung zum Anmelden...</div>;
  }

  return (
    <div className="home-container">
      {/* Preview-Bereich oben */}
      <div className="home-preview">
        {!downloadFilename ? (
          <div className="home-initialScreen">
            <Image
              src={ChatCADLogo}
              alt="ChatCAD-Logo"
              width={150}
              height={150}
              className="home-initialLogo"
            />
            <h1 className="home-initialTitle">ChatCAD</h1>
            <p className="home-subtitle">Create technical drawings in no time</p>
          </div>
        ) : (
          <div ref={viewerContainerRef} className="home-viewer" />
        )}
      </div>

      {/* Eingabe unten */}
      <div className="home-inputContainer">

        {gptAnswer && <p className="home-chatBubble">{gptAnswer}</p>}

        <div className="home-action">
          <input
            type="text"
            className="home-input"
            placeholder="Befehl eingeben... (Enter zum Ausführen)"
            value={elementDescription}
            onChange={(e) => setElementDescription(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {downloadFilename && (
            <button
              className="home-download" 
              onClick={handleDownloadClick}
            >
              Download
            </button>
          )}

          {downloadFilename && (
            <button className="home-download" onClick={handleMatchLv}>
              Matching
            </button>
          )}

          {pdfBuffer && (
            <button className="home-download" onClick={handleDownloadPdf}>
              PDF
            </button>
          )}
        </div>

        {mapping.length > 0 && (
          <div className="lv-table">
            {mapping.map((row, idx) => {
                const best = row.match;                                 // nur noch diesen Key
                const alternatives =
                  (row.alternatives ?? [])
                    // nur LV-Objekte mit Positions-Nr. zulassen
                    .filter(a => (a.Pos ?? a.pos))
                    .map(a => ({ lv: a }));

                return (
                  <div key={idx} className="lv-row">
                    <span className="aufmass grow">{row.aufmass}</span>

                    <select
                      value={best.Pos ?? best.pos}                       // direkt im LV-Objekt
                      onChange={e => {
                        const pos = e.target.value;
                        const altIdx = alternatives.findIndex(a =>
                          (a.lv.Pos ?? a.lv.pos) === pos);
                        if (altIdx !== -1) {
                          const m = structuredClone(mapping);
                          m[idx].match = alternatives[altIdx].lv;
                          setMapping(m);
                        }
                      }}
                    >
                      {[best, ...alternatives.map(a => a.lv)].map(opt => (
                        <option
                          key={opt.Pos ?? opt.pos}
                          value={opt.Pos ?? opt.pos}
                        >
                          {(opt.T1 ?? opt.t1 ?? "-")}.
                          {(opt.T2 ?? opt.t2 ?? "-")}.
                          {(opt.Pos ?? opt.pos)}
                          {" · "}
                          {(opt.category ?? opt.description ?? "")}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })
            }

            <button className="btn-primary mt-4" onClick={handleGenerateInvoice}>
              Rechnung erzeugen
            </button>
          </div>
        )}

        <p className="home-hint">*Das KI-Modell ist limitiert auf die Erzeugung von Baugräben, Rohren, Oberflächenbefestigungen und Durchstichen.</p>
      </div>
    </div>
  );
}
