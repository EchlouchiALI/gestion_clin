"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import { Button } from "@/components/ui/button"

const socket = io("http://localhost:3001")

type Medecin = {
  id: number
  nom: string
  prenom: string
  specialite: string
}

type Message = {
  content: string
  senderRole: "patient" | "medecin"
  createdAt: string
}

export default function ConversationsPatientPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMedecinId, setSelectedMedecinId] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)
  }, [])

  const fetchMedecins = async () => {
    if (!token) return
    const res = await axios.get("http://localhost:3001/patient/medecins", {
      headers: { Authorization: `Bearer ${token}` },
    })
    setMedecins(res.data)
  }

  const fetchMessages = async (medecinId: number) => {
    if (!token) return
    const res = await axios.get(`http://localhost:3001/patient/messages/${medecinId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setMessages(res.data)
  }

  const handleSelect = (medecinId: number) => {
    setSelectedMedecinId(medecinId)
    fetchMessages(medecinId)
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedMedecinId) return

    const msg = {
      sender: "patient",
      content: newMessage,
      receiverId: selectedMedecinId,
    }

    socket.emit("message", msg)
    setMessages((prev) => [
      ...prev,
      { content: newMessage, senderRole: "patient", createdAt: new Date().toISOString() },
    ])
    setNewMessage("")
  }

  useEffect(() => {
    if (!token) return
    fetchMedecins()

    socket.on("message", (msg: any) => {
      if (msg.sender === "medecin" && msg.receiverId === selectedMedecinId) {
        setMessages((prev) => [
          ...prev,
          { content: msg.content, senderRole: "medecin", createdAt: new Date().toISOString() },
        ])
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedMedecinId, token])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💬 Vos Conversations</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* 📋 Liste des médecins */}
        <div className="col-span-1 border rounded p-4">
          <h2 className="font-semibold mb-3">Médecins</h2>
          {medecins.length === 0 ? (
            <p className="text-gray-500">Aucune conversation acceptée.</p>
          ) : (
            medecins.map((m) => (
              <div key={m.id} className="mb-3 flex justify-between items-center">
                <div>
                  <p className="font-bold">{m.nom} {m.prenom}</p>
                  <p className="text-sm text-gray-500">{m.specialite}</p>
                </div>
                <Button onClick={() => handleSelect(m.id)}>Ouvrir</Button>
              </div>
            ))
          )}
        </div>

        {/* 💬 Zone de chat */}
        <div className="col-span-2 border rounded p-4">
          {selectedMedecinId ? (
            <>
              <div className="h-72 overflow-y-auto bg-white border rounded p-3 mb-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 flex ${
                      msg.senderRole === "patient" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className={`inline-block px-3 py-2 rounded-lg max-w-xs text-sm ${
                      msg.senderRole === "patient"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {msg.content}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded px-3 py-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrire un message..."
                />
                <Button onClick={sendMessage}>Envoyer</Button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Sélectionnez un médecin pour discuter.</p>
          )}
        </div>
      </div>
    </div>
  )
}
