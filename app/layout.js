import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "./components/Navbar";
import { SidebarProvider } from "./components/SidebarContext";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CadChat",
  description: "Generate technical drawings in no time",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider>
          <Navbar />
          <div className="main-content">
            {children}
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
