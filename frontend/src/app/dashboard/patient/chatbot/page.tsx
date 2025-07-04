'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    if (!input.trim()) return

    // Ajouter message utilisateur
    const newMessages = [...messages, { from: 'user', text: input }]
    setMessages(newMessages)

    try {
      // Appel API du chatbot (à implémenter)
      const res = await fetch('http://localhost:3001/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await res.json()
      setMessages([...newMessages, { from: 'bot', text: data.reply }])
    } catch (error) {
      console.error('Erreur chatbot', error)
    }

    setInput('')
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Chatbot IA – Aide au patient</h1>

      <div className="bg-white rounded-lg shadow-md p-4 max-h-[60vh] overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-md ${
              msg.from === 'user' ? 'bg-purple-100 text-right' : 'bg-gray-200 text-left'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <Input
          placeholder="Posez votre question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage}>Envoyer</Button>
      </div>
    </div>
  )
}
