"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useSidebar } from "./SidebarContext";

export default function Navbar() {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      router.push("/login");
    } catch (error) {
      console.error("Fehler beim Logout:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          {/* LINKS: Burger-Button für Sidebar (statt ChatCAD-Titel) */}
          <button
            type="button"
            className="navbar-hamburger-button"
            aria-label="Aufmaß-Sidebar umschalten"
            onClick={toggleSidebar}
          >
            <svg
              className="navbar-hamburger-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                // X-Icon wenn offen
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                // Burger-Icon wenn zu
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* RECHTS: Navigation */}
          <div className="navbar-desktop-menu">
            <Link href="/" className="navbar-menu-item">
              Home
            </Link>

            {isLoggedIn ? (
              <button onClick={handleLogout} className="navbar-menu-item">
                Logout
              </button>
            ) : (
              <Link href="/login" className="navbar-menu-item">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
