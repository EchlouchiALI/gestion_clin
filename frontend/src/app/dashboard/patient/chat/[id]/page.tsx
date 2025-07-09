"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import { Button } from "@/components/ui/button"

type Message = {
  content: string
  senderRole: "patient" | "medecin"
  createdAt: string
}

export default function ChatPage() {
  const { id } = useParams() // ID du médecin
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null

  useEffect(() => {
    if (!token || !id) return

    const s = io("http://localhost:3001")
    setSocketInstance(s)

    s.on("connect", () => console.log("🟢 Socket connecté"))
    s.on("message", (msg: any) => {
      if (msg.senderRole === "medecin" && msg.receiverId === user?.id) {
        setMessages((prev) => [
          ...prev,
          { content: msg.content, senderRole: "medecin", createdAt: new Date().toISOString() },
        ])
      }
    })

    return () => {
      s.disconnect()
      s.off("message")
    }
  }, [id])

  useEffect(() => {
    // Charger l'historique
    const fetchConversation = async () => {
      const res = await axios.get(`http://localhost:3001/patient/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data)
    }

    if (token && id) fetchConversation()
  }, [id])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const msg = {
      senderId: user.id,
      senderRole: "patient",
      content: newMessage,
      receiverId: Number(id),
    }

    socketInstance?.emit("message", msg)

    setMessages((prev) => [
      ...prev,
      { content: newMessage, senderRole: "patient", createdAt: new Date().toISOString() },
    ])
    setNewMessage("")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💬 Chat avec le médecin n°{id}</h1>

      <div className="h-96 overflow-y-auto bg-white border rounded p-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 flex ${
              msg.senderRole === "patient" ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-lg max-w-xs text-sm ${
                msg.senderRole === "patient"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
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
    </div>
  )
}
