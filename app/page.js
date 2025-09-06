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
import ChatSidebar from "./components/ChatSidebar";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import ChatCADLogo from "../app/Logo_ChatCAD.png";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const router = useRouter();

  const lastProcessedRef = useRef(0);

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

  const [syncTick, setSyncTick] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [aufmassRows, setAufmassRows] = useState([]);
  const [aufmassEditorOpen, setAufmassEditorOpen] = useState(false);
  const [aufmassText, setAufmassText] = useState("");

  const [hasPositions, setHasPositions] = useState(false);

  // Sidebar-State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const viewerContainerRef = useRef(null);

  const hasPendingSync = step === 2 && !!downloadFilename && (syncTick !== lastProcessedRef.current);

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

  // Automatische Session-Erstellung entfernt - wird nur noch manuell gestartet

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
    if (step !== 2 || !aufmassIsPresent) return;
    if (syncTick === 0 || syncTick === lastProcessedRef.current) return;

    let cancelled = false;
    (async () => {
      await handleMatchLv().catch(console.error);
      if (!cancelled) lastProcessedRef.current = syncTick;
    })();
    return () => { cancelled = true; };
  }, [step, downloadFilename, syncTick]);

  // Sidebar-Zustand bleibt konsistent über alle Bildschirmgrößen
  // Benutzer kann selbst entscheiden ob Sidebar offen oder geschlossen ist

  // Chat-Sessions beim App-Start laden
  useEffect(() => {
    if (isAuthenticated && sidebarRef.current) {
      sidebarRef.current.loadChatSessions();
    }
  }, [isAuthenticated]);

  // Manuell neue Session starten
  async function startNewChat() {
    try {
      const resp = await fetch(`${baseUrl}/start-session`, {
        method: "POST",
      });

      const data = await resp.json();
      setSessionId(data.session_id);

      // Session zur Sidebar hinzufügen
      if (sidebarRef.current) {
        sidebarRef.current.addNewSession(data.session_id, "Neue Unterhaltung gestartet...");
      }

      console.log("Neue Session gestartet:", data.session_id);
    } catch (err) {
      console.error("Fehler beim Starten einer neuen Session:", err);
    }
  }

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
      const resp = await fetch(`${baseUrl}/add-element?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: elementDescription }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        markSessionDirty();
        setGptAnswer(data.answer);
        updateSidebarWithResponse(data.answer);

        setHasPositions(hasAnyPositions(data.updated_json?.elements || []));
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
      const resp = await fetch(`${baseUrl}/generate-dxf-by-session?session_id=${sessionId}`, {
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

      // DXF-Status in Sidebar aktualisieren
      if (sidebarRef.current) {
        sidebarRef.current.updateSessionDxfStatus(sessionId, true);
      }

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
      const resp = await fetch(`${baseUrl}/edit-element?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: elementDescription }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        setGptAnswer(data.answer);
        updateSidebarWithResponse(data.answer);

        setHasPositions(hasAnyPositions(data.updated_json?.elements || []));
        markSessionDirty();
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
      const resp = await fetch(`${baseUrl}/remove-element?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: elementDescription }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        setGptAnswer(data.answer);
        updateSidebarWithResponse(data.answer);

        setHasPositions(hasAnyPositions(data.updated_json?.elements || []));
        markSessionDirty();
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
    const resp = await fetch(`${baseUrl}/match-lv`, {
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

    console.log("Match LV - assigned:", assigned);
    console.log("Match LV - to_review:", to_review);
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
      const resp = await fetch(`${baseUrl}/invoice`, {
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

  function handleReplace({ source, index }, newMatch) {
    if (source === "assigned") {
      setAssigned(arr =>
        arr.map((it, i) => (i === index ? { ...it, match: { ...newMatch } } : it))
      );
    } else if (source === "toReview") {
      setToReview(prev => {
        const item = prev[index];
        const rest = prev.filter((_, i) => i !== index);
        const moved = { ...item, match: { ...newMatch }, confidence: 1.0 };

        setAssigned(a => {
          const exists = a.some(x =>
            x.aufmass === moved.aufmass &&
            x.match?.T1 === moved.match?.T1 &&
            x.match?.T2 === moved.match?.T2 &&
            x.match?.Pos === moved.match?.Pos
          );
          return exists ? a : [...a, moved];
        });

        return rest;
      });
    }
  }

  function hasAnyPositions(items) {
    return items.some((e) => {
      const t = (e?.type || "").toLowerCase();
      return t && t !== "aufmass" && t !== "aufmass_override";
    });
  }

  // helper: Aufmaßtext aus der Session lesen
  async function loadAufmassTextFromSession() {
    if (!sessionId) return;
    try {
      const resp = await fetch(`${baseUrl}/session?session_id=${sessionId}`);
      const data = await resp.json();
      const items = Array.isArray(data?.elements) ? data.elements : [];
      
      setHasPositions(hasAnyPositions(items));

      const last = [...items].reverse().find(e => (e.type || "").toLowerCase() === "aufmass");
      setAufmassText(last?.text || "");
    } catch (e) {
      console.error("Aufmaß-Text laden fehlgeschlagen:", e);
    }
  }

   async function openAufmassEditor() {
    try {
      const resp = await fetch(`${baseUrl}/get-aufmass-lines?session_id=${sessionId}`);
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
    await fetch(`${baseUrl}/set-aufmass-lines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, lines }),
    });

    setAufmassRows(newRows);

    // 2) DXF neu generieren + anzeigen
    await handleGenerateDxf();
    markSessionDirty();
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

  function markSessionDirty() { setSyncTick(t => t + 1); }

  // Sidebar-Handler
  function handleNewSession(newSessionId) {
    setSessionId(newSessionId);
    // Reset der Hauptkomponente für neue Session
    setElementDescription("");
    setGptAnswer("");
    setDxfBuffer(null);
    setDownloadFilename("");
    setAssigned([]);
    setToReview([]);
    setReviewed([]);
    setStep(1);
    setAufmassText("");
    setAufmassRows([]);
    setHasPositions(false);

    // Session zur Sidebar-Liste hinzufügen falls nicht vorhanden
    if (sidebarRef.current) {
      sidebarRef.current.addNewSession(newSessionId, "Neue Unterhaltung gestartet...");
    }
  }

  // Session-Daten vom Server laden
  async function loadSessionData(sessionId) {
    try {
      // 1. Session-Daten laden
      const sessionResp = await fetch(`${baseUrl}/session?session_id=${sessionId}`);
      if (!sessionResp.ok) {
        console.error("Session nicht gefunden");
        return;
      }

      const sessionData = await sessionResp.json();
      const elements = Array.isArray(sessionData?.elements) ? sessionData.elements : [];

      // 2. Prüfen ob Session Positionen hat
      setHasPositions(hasAnyPositions(elements));

      // 3. Letzten GPT-Answer finden
      const lastChatElement = [...elements].reverse().find(e => 
        e.type && !['aufmass', 'aufmass_override'].includes(e.type.toLowerCase())
      );
      if (lastChatElement?.answer) {
        setGptAnswer(lastChatElement.answer);
      } else {
        setGptAnswer("");
      }

      // 4. Aufmaß-Text laden
      const aufmassElement = [...elements].reverse().find(e => 
        (e.type || "").toLowerCase() === "aufmass"
      );
      setAufmassText(aufmassElement?.text || "");

      // 5. DXF generieren und laden falls Positionen vorhanden
      if (elements.length > 0 && hasAnyPositions(elements)) {
        await handleGenerateDxfForSession(sessionId);
      } else {
        // Keine DXF-Daten vorhanden
        setDxfBuffer(null);
        setDownloadFilename("");
      }

      // 6. Step zurücksetzen
      setStep(1);

      console.log("Session-Daten geladen:", sessionData);
    } catch (error) {
      console.error("Fehler beim Laden der Session-Daten:", error);
    }
  }

  // DXF für spezifische Session generieren
  async function handleGenerateDxfForSession(sessionId) {
    try {
      const resp = await fetch(`${baseUrl}/generate-dxf-by-session?session_id=${sessionId}`, {
        method: "POST",
      });
      if (!resp.ok) {
        console.warn("DXF konnte für Session nicht generiert werden");
        return;
      }

      const arrayBuffer = await resp.arrayBuffer();
      const filename = `session_${sessionId}.dxf`;

      setDxfBuffer(arrayBuffer);
      setDownloadFilename(filename);

    } catch (err) {
      console.error("Fehler bei generate-dxf für Session:", err);
    }
  }

  async function handleSessionChange(selectedSessionId) {
    // Session-Zustand zurücksetzen
    setElementDescription("");
    setAssigned([]);
    setToReview([]);
    setReviewed([]);
    setAufmassRows([]);

    // Neue Session ID setzen
    setSessionId(selectedSessionId);

    // Sidebar auf Mobile schließen
    setSidebarOpen(false);

    // Session-Daten laden
    await loadSessionData(selectedSessionId);
  }

  // Chat-Antwort an Sidebar weiterleitung
  function updateSidebarWithResponse(response) {
    if (sidebarRef.current && response) {
      sidebarRef.current.updateCurrentSession(response);
    }
  }

  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  return (
    <div className="home-container">
      {/* Chat-Sidebar */}
      <ChatSidebar
        ref={sidebarRef}
        currentSessionId={sessionId}
        onSessionChange={handleSessionChange}
        onNewSession={handleNewSession}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Top-Bar mit Buttons */}
      <div className="top-bar">
        {/* Sidebar-Toggle-Button */}
        <button 
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Chat-Verlauf anzeigen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Neuen Chat starten Button */}
        <button
          onClick={startNewChat}
          className="new-chat-btn"
          aria-label="Neuen Chat starten"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="new-chat-btn-text">Neuer Chat</span>
        </button>
      </div>

      {/* Hauptinhalt-Wrapper */}
      <div className={`main-content ${sidebarOpen ? 'main-content--with-sidebar' : ''}`}>
      <StepSwitcher step={step} setStep={setStep} onAuxClick={openAufmassEditor} hasPositions={hasPositions}/>
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
              {!sessionId && (
                <p className="text-gray-400 text-sm">
                  Klicken Sie auf "Neuer Chat" um zu beginnen
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {step === 1 && sessionId && (
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
          onGeneratePdf={handleGenerateAndDownload}
          isGenerating={isGeneratingPdf}
          loadingAssigned={hasPendingSync}
          loadingReview={hasPendingSync}
          onReplace={handleReplace}
        />
      )}

      {step === 1 && sessionId && (
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
    </div>
  );
}
