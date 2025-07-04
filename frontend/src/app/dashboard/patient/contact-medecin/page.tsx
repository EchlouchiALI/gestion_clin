'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Message = {
  id: number
  content: string
  senderRole: 'patient' | 'medecin'
  createdAt: string
  sender: {
    id: number
    prenom: string
    nom: string
  }
}

export default function Page() {
  const [medecinId, setMedecinId] = useState<number>(2) // ID fixe ou à rendre dynamique
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const res = await fetch(`http://localhost:3001/patient/messages/${medecinId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const res = await fetch('http://localhost:3001/patient/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: medecinId,
        }),
      })

      if (res.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Erreur envoi message:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [medecinId])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">💬 Contacter mon médecin</h1>

      <div className="border rounded-lg p-4 h-[400px] overflow-y-auto bg-gray-50 mb-4">
        {loading ? (
          <p>Chargement des messages...</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 max-w-[75%] ${
                msg.senderRole === 'patient' ? 'ml-auto text-right' : 'mr-auto text-left'
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.senderRole === 'patient' ? 'bg-blue-200' : 'bg-gray-300'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button onClick={sendMessage}>Envoyer</Button>
      </div>
    </div>
  )
}
