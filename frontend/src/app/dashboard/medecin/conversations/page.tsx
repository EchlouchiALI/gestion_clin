"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import { Button } from "@/components/ui/button"

const socket = io("http://localhost:3001")

type Demande = {
  id: number
  content: string
  createdAt: string
  sender: {
    id: number
    nom: string
    prenom: string
    email: string
  }
}

type Message = {
  content: string
  senderRole: "patient" | "medecin"
  createdAt: string
}

export default function ConversationsPage() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)
  }, [])

  const fetchDemandes = async () => {
    if (!token) return
    const res = await axios.get("http://localhost:3001/medecin/demandes", {
      headers: { Authorization: `Bearer ${token}` },
    })
    setDemandes(res.data)
  }

  const fetchConversation = async (patientId: number) => {
    if (!token) return
    const res = await axios.get(`http://localhost:3001/medecin/conversations/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setMessages(res.data)
  }

  const handleAccept = async (patientId: number) => {
    if (!token) return
    await axios.post(
      "http://localhost:3001/medecin/demandes/accept",
      { patientId },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    await fetchDemandes()
    setSelectedPatientId(patientId)
    fetchConversation(patientId)
  }

  const handleReject = async (demandeId: number) => {
    if (!token) return
    await axios.delete(`http://localhost:3001/messages/${demandeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    await fetchDemandes()
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedPatientId) return

    const msg = {
      sender: "medecin",
      content: newMessage,
      receiverId: selectedPatientId,
    }

    socket.emit("message", msg)
    setMessages((prev) => [
      ...prev,
      { content: newMessage, senderRole: "medecin", createdAt: new Date().toISOString() },
    ])
    setNewMessage("")
  }

  useEffect(() => {
    if (!token) return
    fetchDemandes()

    socket.on("message", (msg: any) => {
      if (msg.sender === "patient" && msg.receiverId === selectedPatientId) {
        setMessages((prev) => [
          ...prev,
          { content: msg.content, senderRole: "patient", createdAt: new Date().toISOString() },
        ])
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedPatientId, token])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💬 Conversations</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* 📥 Liste des demandes */}
        <div className="col-span-1 border rounded p-4">
          <h2 className="font-semibold mb-3">📋 Demandes reçues</h2>
          {demandes.length === 0 && (
            <p className="text-gray-500">Aucune demande pour l’instant.</p>
          )}
          {demandes.map((d) => (
            <div key={d.id} className="mb-3 flex justify-between items-center">
              <div>
                <p className="font-bold">{d.sender.nom} {d.sender.prenom}</p>
                <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleAccept(d.sender.id)}>Accepter</Button>
                <Button variant="destructive" onClick={() => handleReject(d.id)}>Refuser</Button>
              </div>
            </div>
          ))}
        </div>

        {/* 💬 Chat */}
        <div className="col-span-2 border rounded p-4">
          {selectedPatientId ? (
            <>
              <div className="h-72 overflow-y-auto bg-white border rounded p-3 mb-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 flex ${
                      msg.senderRole === "medecin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className={`inline-block px-3 py-2 rounded-lg max-w-xs text-sm ${
                      msg.senderRole === "medecin"
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
            <p className="text-gray-500">Sélectionnez un patient pour commencer une conversation.</p>
          )}
        </div>
      </div>
    </div>
  )
}
