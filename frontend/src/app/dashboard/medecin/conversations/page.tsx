"use client"
import { useEffect, useState, useRef } from "react"
import type React from "react"
import axios from "axios"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Send,
  MessageCircle,
  User,
  Stethoscope,
  Search,
  Clock,
  Check,
  X,
  UserCheck,
  Bell,
} from "lucide-react"

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
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}

  // Auto scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)
  }, [])

  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocketInstance(s)
    return () => {
      s.disconnect()
    }
  }, [])

  const fetchDemandes = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await axios.get("http://localhost:3001/medecin/demandes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDemandes(res.data)
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConversation = async (patientId: number) => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await axios.get(`http://localhost:3001/medecin/conversations/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data)
    } catch (error) {
      console.error("Erreur lors du chargement de la conversation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (patientId: number, patient: any) => {
    if (!token) return
    try {
      await axios.post(
        "http://localhost:3001/medecin/demandes/accept",
        { patientId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      await fetchDemandes()
      setSelectedPatientId(patientId)
      setSelectedPatient(patient)
      fetchConversation(patientId)
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error)
    }
  }

  const handleReject = async (demandeId: number) => {
    if (!token) return
    try {
      await axios.delete(`http://localhost:3001/messages/${demandeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchDemandes()
    } catch (error) {
      console.error("Erreur lors du refus:", error)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedPatientId) return

    const msg = {
      senderId: user?.id,
      senderRole: "medecin",
      content: newMessage,
      receiverId: selectedPatientId,
    }

    socketInstance?.emit("message", msg)
    setMessages((prev) => [
      ...prev,
      { content: newMessage, senderRole: "medecin", createdAt: new Date().toISOString() },
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

  useEffect(() => {
    if (!token) return
    fetchDemandes()
    socketInstance?.on("message", (msg: any) => {
      if (msg.sender === "patient" && msg.receiverId === selectedPatientId) {
        setMessages((prev) => [
          ...prev,
          { content: msg.content, senderRole: "patient", createdAt: new Date().toISOString() },
        ])
      }
    })
    return () => {
      socketInstance?.off("message")
    }
  }, [selectedPatientId, token, socketInstance])

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

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filtrer les demandes
  const filteredDemandes = demandes.filter((demande) =>
    `${demande.sender.prenom} ${demande.sender.nom}`.toLowerCase().includes(searchTerm.toLowerCase()),
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
              <h1 className="text-xl font-semibold text-gray-900">Consultations</h1>
              <p className="text-sm text-gray-500">Gestion des demandes patients</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {demandes.length} demande{demandes.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Liste des demandes */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-0 focus:bg-white"
              />
            </div>
          </div>

          {/* Liste des demandes */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredDemandes.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {demandes.length === 0 ? "Aucune demande pour l'instant" : "Aucun patient trouvé"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {filteredDemandes.map((demande) => (
                  <div
                    key={demande.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {demande.sender.prenom} {demande.sender.nom}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{demande.sender.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatDate(demande.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {demande.content && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 leading-relaxed">{demande.content}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(demande.sender.id, demande.sender)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(demande.id)}
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat principale */}
        <div className="flex-1 flex flex-col">
          {selectedPatient ? (
            <>
              {/* Header du chat */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedPatient.prenom} {selectedPatient.nom}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 ml-auto">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Consultation acceptée
                  </Badge>
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Consultation démarrée</h3>
                      <p className="text-gray-500">La conversation avec le patient peut commencer</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <div
                          key={`${message.createdAt}-${index}`}
                          className={`flex gap-3 ${message.senderRole === "medecin" ? "flex-row-reverse" : ""}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback
                              className={
                                message.senderRole === "medecin"
                                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                                  : "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                              }
                            >
                              {message.senderRole === "medecin" ? (
                                <Stethoscope className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`flex flex-col max-w-xs lg:max-w-md ${message.senderRole === "medecin" ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`px-4 py-2 rounded-2xl shadow-sm ${
                                message.senderRole === "medecin"
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
                        placeholder="Répondre au patient..."
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
                  <UserCheck className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Acceptez une consultation</h3>
                <p className="text-gray-500 leading-relaxed">
                  Sélectionnez une demande de consultation dans la liste pour commencer à discuter avec le patient
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
