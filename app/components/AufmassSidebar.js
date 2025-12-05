"use client";

import React from "react";
import AufmassSidebarItem from "./AufmassSidebarItem";

export default function AufmassSidebar({
  items,
  selectedId,
  onSelect,
  onNewChat,
}) {
  return (
    <aside className="aufmass-sidebar">
      {/* Header */}
      <div className="aufmass-sidebar__header">
        <div>
          <h2 className="aufmass-sidebar__title">Aufmaß-Chats</h2>
          <p className="aufmass-sidebar__subtitle">
            Deine bisherigen Aufmaß-Chats.
          </p>
        </div>

        {onNewChat && (
          <button
            type="button"
            onClick={onNewChat}
            className="aufmass-sidebar__new-btn"
            title="Neuer Aufmaß-Chat"
          >
            +
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="aufmass-sidebar__list-container">
        {items.length === 0 ? (
          <p className="aufmass-sidebar__empty-text">
            Noch keine Aufmaß-Chats vorhanden.
          </p>
        ) : (
          <ul className="aufmass-sidebar-list">
            {items.map((item) => (
              <AufmassSidebarItem
                key={item.id}
                item={item}
                isActive={item.id === selectedId}
                onClick={() => onSelect && onSelect(item.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

