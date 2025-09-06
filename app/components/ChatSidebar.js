"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../firebase";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// SVG Icons
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChatBubbleLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const FolderIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

export default function ChatSidebar({ 
  currentSessionId, 
  onSessionChange, 
  onNewSession,
  isOpen,
  onToggle 
}) {
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatSessions();
  }, []);

  // Lade Chat-Sessions aus localStorage und Firebase
  async function loadChatSessions() {
    try {
      // Zuerst aus localStorage laden
      const localSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      setChatSessions(localSessions);

      // Optional: Hier könnten Sie auch Sessions aus Firebase laden
      // const user = auth.currentUser;
      // if (user) {
      //   // Firebase-Integration für persistente Sessions
      // }

      setLoading(false);
    } catch (error) {
      console.error("Fehler beim Laden der Chat-Sessions:", error);
      setLoading(false);
    }
  }

  // Neue Session erstellen
  async function handleNewSession() {
    try {
      const resp = await fetch(`${baseUrl}/start-session`, {
        method: "POST",
      });
      const data = await resp.json();

      const newSession = {
        id: data.session_id,
        name: `Neue Unterhaltung ${chatSessions.length + 1}`,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        preview: "Neue Unterhaltung gestartet...",
        hasDxf: false
      };

      const updatedSessions = [newSession, ...chatSessions];
      setChatSessions(updatedSessions);
      saveSessions(updatedSessions);

      // Session wechseln (wird automatisch zur Liste hinzugefügt)
      onNewSession(data.session_id);
    } catch (error) {
      console.error("Fehler beim Erstellen einer neuen Session:", error);
    }
  }

  // Session auswählen
  function handleSessionSelect(session) {
    onSessionChange(session.id);
    updateSessionActivity(session.id);
  }

  // Session löschen
  function handleDeleteSession(sessionId, event) {
    event.stopPropagation();
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    saveSessions(updatedSessions);

    // Wenn aktuelle Session gelöscht wird
    if (sessionId === currentSessionId) {
      if (updatedSessions.length > 0) {
        // Auf die nächste verfügbare Session wechseln
        const nextSession = updatedSessions[0];
        onSessionChange(nextSession.id);
      } else {
        // Nur wenn keine Sessions mehr vorhanden sind, neue Session erstellen
        handleNewSession();
      }
    }
  }

  // Session-Aktivität aktualisieren
  function updateSessionActivity(sessionId) {
    const updatedSessions = chatSessions.map(session => 
      session.id === sessionId 
        ? { ...session, lastActivity: new Date().toISOString() }
        : session
    );
    setChatSessions(updatedSessions);
    saveSessions(updatedSessions);
  }

  // Aktuelle Session aktualisieren (z.B. nach neuem Chat)
  function updateCurrentSession(preview, hasDxf = false) {
    if (!currentSessionId) return;

    const updatedSessions = chatSessions.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            preview: preview.slice(0, 100) + (preview.length > 100 ? '...' : ''),
            lastActivity: new Date().toISOString(),
            hasDxf: hasDxf
          }
        : session
    );
    setChatSessions(updatedSessions);
    saveSessions(updatedSessions);
  }

  // Session-DXF-Status aktualisieren
  function updateSessionDxfStatus(sessionId, hasDxf) {
    const updatedSessions = chatSessions.map(session => 
      session.id === sessionId 
        ? { ...session, hasDxf: hasDxf, lastActivity: new Date().toISOString() }
        : session
    );
    setChatSessions(updatedSessions);
    saveSessions(updatedSessions);
  }

  // Sessions in localStorage speichern
  function saveSessions(sessions) {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }

  // Session umbenennen
  function handleRenameSession(sessionId, newName) {
    const updatedSessions = chatSessions.map(session =>
      session.id === sessionId ? { ...session, name: newName } : session
    );
    setChatSessions(updatedSessions);
    saveSessions(updatedSessions);
  }

  // Formatiere Datum
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Gerade eben";
    if (diffInHours < 24) return `vor ${Math.floor(diffInHours)} Stunden`;
    if (diffInHours < 168) return `vor ${Math.floor(diffInHours / 24)} Tagen`;
    return date.toLocaleDateString('de-DE');
  }

  // Session zur Liste hinzufügen (wird von parent component aufgerufen)
  React.useImperativeHandle(React.forwardRef(() => {}), () => ({
    updateCurrentSession,
    updateSessionDxfStatus,
    addNewSession: (sessionId, preview = "") => {
      if (chatSessions.find(s => s.id === sessionId)) return;

      const newSession = {
        id: sessionId,
        name: `Unterhaltung ${chatSessions.length + 1}`,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        preview: preview || "Neue Unterhaltung...",
        hasDxf: false
      };

      const updatedSessions = [newSession, ...chatSessions];
      setChatSessions(updatedSessions);
      saveSessions(updatedSessions);
    },
    loadChatSessions: () => loadChatSessions()
  }), [chatSessions]);

  // Expose functions für externe Nutzung
  React.useEffect(() => {
    if (currentSessionId && chatSessions.length > 0 && !chatSessions.find(s => s.id === currentSessionId)) {
      // Neue Session automatisch zur Liste hinzufügen
      const newSession = {
        id: currentSessionId,
        name: `Unterhaltung ${chatSessions.length + 1}`,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        preview: "Neue Unterhaltung gestartet...",
        hasDxf: false
      };

      const updatedSessions = [newSession, ...chatSessions];
      setChatSessions(updatedSessions);
      saveSessions(updatedSessions);
    }
  }, [currentSessionId, chatSessions]);

  return (
    <>
      {/* Overlay für mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`chat-sidebar ${isOpen ? 'chat-sidebar--open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <button
            onClick={handleNewSession}
            className="sidebar-new-chat-btn"
          >
            <PlusIcon className="w-4 h-4" />
            Neue Unterhaltung
          </button>
        </div>

        {/* Chat-Liste */}
        <div className="sidebar-content">
          {loading ? (
            <div className="sidebar-loading">
              <div className="spinner" />
              <span>Lade Unterhaltungen...</span>
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="sidebar-empty">
              <FolderIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Noch keine Unterhaltungen</p>
            </div>
          ) : (
            <div className="sidebar-sessions">
              {chatSessions
                .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
                .map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onSelect={() => handleSessionSelect(session)}
                    onDelete={(e) => handleDeleteSession(session.id, e)}
                    onRename={(newName) => handleRenameSession(session.id, newName)}
                    formatDate={formatDate}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="text-xs text-gray-500">
            ChatCAD v1.0
          </div>
        </div>
      </div>
    </>
  );
}

// Einzelne Session-Item Komponente
function SessionItem({ session, isActive, onSelect, onDelete, onRename, formatDate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);

  function handleSaveName() {
    if (editName.trim() && editName !== session.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditName(session.name);
      setIsEditing(false);
    }
  }

  return (
    <div 
      className={`session-item ${isActive ? 'session-item--active' : ''}`}
      onClick={onSelect}
    >
      <div className="session-main">
        <div className="session-icon-wrapper">
          <ChatBubbleLeftIcon className="session-icon" />
          {session.hasDxf && (
            <div className="session-dxf-indicator" title="Enthält DXF-Datei">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
              </svg>
            </div>
          )}
        </div>
        <div className="session-content">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="session-name-input"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <div 
                className="session-name"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                {session.name}
              </div>
              <div className="session-preview">
                {session.preview}
              </div>
              <div className="session-date">
                {formatDate(session.lastActivity)}
              </div>
            </>
          )}
        </div>
      </div>

      <button
        className="session-delete-btn"
        onClick={onDelete}
        title="Unterhaltung löschen"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
