"use client"
import { useEffect, useState, useRef } from "react"
import type React from "react"
import { io, type Socket } from "socket.io-client"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, MessageCircle, User, Stethoscope, Search, Clock } from "lucide-react"

type Medecin = {
  id: number
  nom: string
  prenom: string
}

type Message = {
  content: string
  senderRole: "patient" | "medecin"
  createdAt: string
}

export default function PatientConversationsPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMedecinId, setSelectedMedecinId] = useState<number | null>(null)
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null

  // Auto scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Connexion socket.io
  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocketInstance(s)
    return () => {
      s.disconnect()
      s.off("message")
    }
  }, [])

  // Récupérer tous les médecins
  const fetchMedecins = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await axios.get("http://localhost:3001/patient/medecins", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMedecins(res.data)
    } catch (error) {
      console.error("Erreur lors du chargement des médecins:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger conversation avec un médecin sélectionné
  const fetchConversation = async (medecinId: number) => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await axios.get(`http://localhost:3001/patient/messages/${medecinId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data)
    } catch (error) {
      console.error("Erreur lors du chargement de la conversation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sélectionner un médecin
  const handleSelectMedecin = (medecin: Medecin) => {
    setSelectedMedecinId(medecin.id)
    setSelectedMedecin(medecin)
    fetchConversation(medecin.id)
  }

  // Envoyer un message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedMedecinId) return

    const msg = {
      senderId: user.id,
      senderRole: "patient",
      content: newMessage,
      receiverId: selectedMedecinId,
    }

    socketInstance?.emit("message", msg)
    setMessages((prev) => [
      ...prev,
      { content: newMessage, senderRole: "patient", createdAt: new Date().toISOString() },
    ])
    setNewMessage("")
  }

  // Gérer l'envoi avec Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Écoute des nouveaux messages
  useEffect(() => {
    fetchMedecins()
    socketInstance?.on("message", (msg: any) => {
      if (msg.senderRole === "medecin" && msg.receiverId === user?.id) {
        setMessages((prev) => [
          ...prev,
          { content: msg.content, senderRole: "medecin", createdAt: new Date().toISOString() },
        ])
      }
    })
    return () => {
      socketInstance?.off("message")
    }
  }, [socketInstance])

  // Fonction pour retourner à la page précédente
  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back()
    }
  }

  // Formater l'heure
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filtrer les médecins
  const filteredMedecins = medecins.filter((medecin) =>
    `${medecin.prenom} ${medecin.nom}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header principal */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="hover:bg-gray-100 rounded-full p-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500">Consultations en ligne</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Liste des médecins */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un médecin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-0 focus:bg-white"
              />
            </div>
          </div>

          {/* Liste des médecins */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredMedecins.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun médecin trouvé</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredMedecins.map((medecin) => (
                  <div
                    key={medecin.id}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedMedecinId === medecin.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectMedecin(medecin)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          Dr. {medecin.prenom} {medecin.nom}
                        </p>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Disponible maintenant
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat principale */}
        <div className="flex-1 flex flex-col">
          {selectedMedecin ? (
            <>
              {/* Header du chat */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Dr. {selectedMedecin.prenom} {selectedMedecin.nom}
                    </h3>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      En ligne
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <MessageCircle className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Commencez votre consultation</h3>
                      <p className="text-gray-500">Décrivez vos symptômes ou posez vos questions au médecin</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <div
                          key={`${message.createdAt}-${index}`}
                          className={`flex gap-3 ${message.senderRole === "patient" ? "flex-row-reverse" : ""}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback
                              className={
                                message.senderRole === "patient"
                                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                                  : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                              }
                            >
                              {message.senderRole === "patient" ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Stethoscope className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`flex flex-col max-w-xs lg:max-w-md ${message.senderRole === "patient" ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`px-4 py-2 rounded-2xl shadow-sm ${
                                message.senderRole === "patient"
                                  ? "bg-blue-600 text-white rounded-br-md"
                                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-2">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </div>

              {/* Zone de saisie */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message..."
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full px-4 py-3"
                      />
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageCircle className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sélectionnez un médecin</h3>
                <p className="text-gray-500 leading-relaxed">
                  Choisissez un médecin dans la liste pour commencer votre consultation en ligne
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
