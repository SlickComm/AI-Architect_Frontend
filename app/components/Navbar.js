"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Navbar() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    /*const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();*/
  }, []);

  const handleLogout = async () => {
    try {
//      await signOut(auth);
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
                <div className="navbar-brand">
                    <Link href="/">ChatCAD</Link>
                </div>

                <div className="navbar-hamburger">
                <button
                    type="button"
                    className="navbar-hamburger-button"
                    aria-controls="mobile-menu"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg
                    className="navbar-hamburger-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    {isOpen ? (
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                    </svg>
                </button>
                </div>

                <div className="navbar-desktop-menu">
                    <Link href="/" className="navbar-menu-item">
                        Home
                    </Link>

                    {/* {isLoggedIn && (
                        <Link href="/workflow" className="navbar-menu-item">
                            Workflow
                        </Link>
                    )} */}

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

        {isOpen && (
        <div className="navbar-mobile-menu" id="mobile-menu">
            <div className="navbar-mobile-inner">
            <Link
                href="/"
                className="navbar-mobile-item"
                onClick={() => setIsOpen(false)}
            >
                Home
            </Link>

            {isLoggedIn && (
              <Link
                href="/workflow"
                className="navbar-mobile-item"
                onClick={() => setIsOpen(false)}
              >
                Workflow
              </Link>
            )}

            {isLoggedIn ? (
                <button
                onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                }}
                className="navbar-mobile-item navbar-mobile-button"
                >
                Logout
                </button>
            ) : (
                <Link
                href="/login"
                className="navbar-mobile-item"
                onClick={() => setIsOpen(false)}
                >
                Login
                </Link>
            )}
            </div>
        </div>
        )}
    </nav>
  );
}
