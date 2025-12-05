"use client";

import { createContext, useContext, useState, useCallback } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const value = { isSidebarOpen, toggleSidebar };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error(
      "useSidebar muss innerhalb von <SidebarProvider> verwendet werden."
    );
  }
  return ctx;
}
