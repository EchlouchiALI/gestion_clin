import "./globals.css"
//import Navbar from "@/components/Navbar"
import { Toaster } from "sonner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clinique Atlas",
  description: "Système de gestion médicale intelligent",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900 font-sans">
        
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
