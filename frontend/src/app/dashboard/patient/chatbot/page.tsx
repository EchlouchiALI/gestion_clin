"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Send, Bot, User, Shield, Award, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Message = {
  from: "user" | "bot"
  text: string
  timestamp: Date
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Message d'accueil automatique
  useEffect(() => {
    const welcomeMessage: Message = {
      from: "bot",
      text: "Bonjour chez Clinique Atlas ! 👋\n\nJe suis votre assistant virtuel de santé. Avec quoi puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const userMessage: Message = {
      from: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch("http://localhost:3001/patient/chatbot/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: userMessage.text }),
      });
  
      const data = await res.json();
  
      // Affichage de la réponse IA
      const botResponse: Message = {
        from: "bot",
        text: data.response,
        timestamp: new Date(),
      };
  
      const messagesToAdd: Message[] = [botResponse];
  
      // Si spécialité détectée → on cherche les médecins
      if (data.specialite && data.specialite.length < 50) {
        messagesToAdd.push({
          from: "bot",
          text: `🩺 En fonction de vos symptômes, il est recommandé de consulter un(e) ${data.specialite}.`,
          timestamp: new Date(),
        });
  
        // Appel API pour récupérer les médecins
        const resMed = await fetch(`http://localhost:3001/medecin/specialite/${data.specialite}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const medecins = await resMed.json();
  
        if (medecins.length === 0) {
          messagesToAdd.push({
            from: "bot",
            text: `❌ Aucun médecin ${data.specialite} n'est disponible pour le moment.`,
            timestamp: new Date(),
          });
        } else {
          medecins.forEach((med: any) => {
            messagesToAdd.push({
              from: "bot",
              text: `👨‍⚕️ Dr. ${med.prenom} ${med.nom} – ${med.specialite}\n📧 ${med.email}\n📞 ${med.telephone}`,
              timestamp: new Date(),
            });
          });
        }
      }
  
      setMessages((prev) => [...prev, ...messagesToAdd]);
    } catch (error) {
      console.error("❌ Erreur dans le chatbot :", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "❌ Une erreur est survenue. Veuillez réessayer.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  
  
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-5xl h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clinique Atlas</h1>
                <p className="text-sm text-gray-600 font-medium">Assistant Médical Professionnel</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Sécurisé & Confidentiel</span>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white mx-8 my-6 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Messages Area */}
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  } animate-in slide-in-from-bottom-2 duration-300`}
                >
                  {msg.from === "bot" && (
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[65%] ${
                      msg.from === "user"
                        ? "bg-gray-900 text-white rounded-3xl rounded-br-lg"
                        : "bg-gray-50 text-gray-900 rounded-3xl rounded-bl-lg border border-gray-200"
                    } px-6 py-4 shadow-sm`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
                    <p className={`text-xs mt-3 ${msg.from === "user" ? "text-gray-300" : "text-gray-500"}`}>
                      {msg.timestamp.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {msg.from === "user" && (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-50 rounded-3xl rounded-bl-lg px-6 py-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">L'assistant analyse votre demande...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-8">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Décrivez vos symptômes ou posez une question médicale..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl py-4 px-6 text-base font-medium focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs bg-gray-200 rounded text-gray-600 font-mono">↵</kbd>
                  </div>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-8 py-4 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Service disponible 24h/24</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <span>Données chiffrées et protégées</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3" />
                  <span>Certifié ISO 27001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
