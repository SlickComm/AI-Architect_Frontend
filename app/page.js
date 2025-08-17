"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image'

import { Viewer } from "three-dxf";
import DxfParser from "dxf-parser";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import ReviewPane from "./components/ReviewPane";
import StepSwitcher from "./components/StepSwitcher";
import Tooltip from "./components/Tooltip";
import EditAufmassModal from "./components/EditAufmassModal";

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

  const [assigned, setAssigned] = useState([]);
  const [toReview, setToReview] = useState([]);
  const [reviewed, setReviewed] = useState([]);

  const [step, setStep] = useState(1);

  const [needsSync, setNeedsSync] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [aufmassRows, setAufmassRows] = useState([]);
  const [aufmassEditorOpen, setAufmassEditorOpen] = useState(false);
  const [aufmassText, setAufmassText] = useState("");

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
    if (step === 1 && downloadFilename && dxfBuffer && viewerContainerRef.current) {
      renderDXF(dxfBuffer);
    }
  }, [step, downloadFilename, dxfBuffer]);

  useEffect(() => {
    const aufmassIsPresent = !!downloadFilename;
    
    if (step === 2 && aufmassIsPresent && needsSync) {
      (async () => {
        await handleMatchLv();
        setNeedsSync(false);
      })();
    }
  }, [step, needsSync, downloadFilename]);

  // --------------------------
  // Start Session
  // --------------------------
  async function handleStartSession() {
    try {
      const resp = await fetch(`${baseUrl}/start-session`, {
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
        markSessionDirty();
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

      await loadAufmassTextFromSession();

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

    const {assigned, to_review} = await resp.json();

    setAssigned(assigned);
    setToReview(to_review);
  }

  // Wenn aus toReview ein User-Match gewählt hat:
  function confirmReview(idx, chosenMatch) {
    const item = toReview[idx];
    const done = {
      ...item,
      match: chosenMatch,
      confidence: 1.0,
    };

    setReviewed(r => [...r, done]);
    setToReview(tr => tr.filter((_, i) => i !== idx));
  }

  async function handleGenerateAndDownload() {
    if (isGeneratingPdf) return;           // doppelklick-Schutz
    setIsGeneratingPdf(true);
    try {
      // 1) PDF vom Server holen
      const mapping = [...assigned, ...reviewed];
      const resp = await fetch(`${baseUrl}/invoice/`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ session_id: sessionId, mapping }),
      });
      const blob = await resp.blob();

      // 2) sofort downloaden
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Rechnung.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF-Fehler:", err);
      alert("PDF konnte nicht erstellt werden.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function handleReplace({ source, index }, newRow) {
    if (source === "assigned") {
      setAssigned((arr) =>
        arr.map((it, i) =>
          i === index ? { ...it, match: { ...newRow } } : it
        )
      );
    } else if (source === "toReview") {
      // simple Variante: nur in-place ersetzen (oder direkt ins "assigned" schieben)
      setToReview((arr) =>
        arr.map((it, i) =>
          i === index ? { ...it, match: { ...newRow } } : it
        )
      );
    }
  }

  // helper: Aufmaßtext aus der Session lesen
  async function loadAufmassTextFromSession() {
    if (!sessionId) return;
    try {
      const resp = await fetch(`${baseUrl}/session?session_id=${sessionId}`);
      const data = await resp.json();
      const items = Array.isArray(data?.elements) ? data.elements : [];
      // letztes "aufmass"-Element nehmen
      const last = [...items].reverse().find(e => (e.type || "").toLowerCase() === "aufmass");
      setAufmassText(last?.text || "");
    } catch (e) {
      console.error("Aufmaß-Text laden fehlgeschlagen:", e);
    }
  }

   async function openAufmassEditor() {
    try {
      const resp = await fetch(`${baseUrl}/get-aufmass-lines/?session_id=${sessionId}`);
      if (resp.ok) {
        const { lines } = await resp.json();
        if (lines?.length) {
          setAufmassRows(lines.map(t => ({ text: t, note: "" })));
        } else if (!aufmassText) {
          // Fallback: Aufmaß-Text aus Session laden
          await loadAufmassTextFromSession();
        }
      }
    } catch {}
    
    setAufmassEditorOpen(true);
  }


  async function saveAufmassRows(newRows) {
    // newRows: [{text, note}] vom Modal
    const lines = newRows.map(r => (r.text ?? "").trim()).filter(Boolean);

    // 1) an Backend speichern
    await fetch(`${baseUrl}/set-aufmass-lines/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, lines }),
    });

    setAufmassRows(newRows);

    // 2) DXF neu generieren + anzeigen
    await handleGenerateDxf();
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

  function markSessionDirty() { setNeedsSync(true); }

  return (
    <div className="home-container">
      <StepSwitcher step={step} setStep={setStep} onAuxClick={openAufmassEditor} />
      {/* Preview-Bereich oben */}
      {step === 1 && (
        <div className="home-preview">
          {downloadFilename ? (
            /* DXF-Viewer */
            <div ref={viewerContainerRef} className="home-viewer" />
          ) : (
            /* Initialer Platzhalter */
            <div className="home-initialScreen">
              <Image src={ChatCADLogo} alt="ChatCAD-Logo" width={150} height={150} />
              <h1 className="home-initialTitle">ChatCAD</h1>
              <p className="home-subtitle">Create technical drawings in no time</p>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="home-inputContainer">
          {gptAnswer && <p className="home-chatBubble">{gptAnswer}</p>}
            <div className="home-action">
              <Tooltip />

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
              
          </div>
        </div>
      )}
        
      {step === 2 && (
        <ReviewPane
          assigned={assigned}
          toReview={toReview}
          onSelect={confirmReview}
          onGeneratePdf={handleGenerateAndDownload}
          isGenerating={isGeneratingPdf}
          loadingAssigned={step === 2 && needsSync}
          loadingReview={step === 2 && needsSync} 
          onReplace={handleReplace}
        />
      )}

      {step === 1 && (
        <p className="home-hint">*Das KI-Modell ist limitiert auf die Erzeugung von Baugräben, Rohren, Oberflächenbefestigungen und Durchstichen.</p>
      )}

      {/* Aufmaß-Editor Modal */}
      <EditAufmassModal
        open={aufmassEditorOpen}
        onClose={() => setAufmassEditorOpen(false)}
        rows={aufmassRows}
        rawText={aufmassText}           
        onSave={(rows) => saveAufmassRows(rows)}
      />
    </div>
  );
}
