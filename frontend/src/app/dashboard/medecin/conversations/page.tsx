"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import io from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  MessageCircle,
  Users,
  Clock,
  Send,
  Check,
  X,
  Stethoscope,
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react"

const socket = io("http://localhost:3001", { autoConnect: false })

interface Demande {
  id: number
  sender: {
    id: number
    nom: string
    prenom: string
  }
}

interface Patient {
  id: number
  nom: string
  prenom: string
}

interface Message {
  id: number
  content: string
  senderRole: "medecin" | "patient"
  createdAt: string
}

export default function MedecinConversationsPage() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<string>("")
  const [notificationType, setNotificationType] = useState<"success" | "error">("success")

  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""

  // Fonction pour afficher les notifications
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification(message)
    setNotificationType(type)
    setTimeout(() => setNotification(""), 4000)
  }

  useEffect(() => {
    fetchDemandes()
    fetchConversations()
  }, [])

  useEffect(() => {
    socket.connect()
    socket.on("receive_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg])
    })
    return () => {
      socket.disconnect()
    }
  }, [])

  // Auto-scroll des messages
  useEffect(() => {
    const chatBox = document.getElementById("chat-messages")
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight
    }
  }, [messages])

  const fetchDemandes = async () => {
    try {
      const res = await axios.get("http://localhost:3001/medecin/demandes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDemandes(res.data)
    } catch (error) {
      showNotification("Erreur lors du chargement des demandes", "error")
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await axios.get("http://localhost:3001/medecin/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatients(res.data)
    } catch (error) {
      showNotification("Erreur lors du chargement des conversations", "error")
    }
  }

  const accepterDemande = async (patientId: number) => {
    setIsLoading(true)
    try {
      await axios.post(
        "http://localhost:3001/medecin/demandes/accept",
        { patientId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      await fetchDemandes()
      await fetchConversations()
      showNotification("Demande acceptée avec succès !", "success")
    } catch (error) {
      showNotification("Erreur lors de l'acceptation", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const refuserDemande = async (patientId: number) => {
    setIsLoading(true)
    try {
      await axios.post(
        "http://localhost:3001/medecin/demandes/refuse",
        { patientId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      await fetchDemandes()
      showNotification("Demande refusée", "success")
    } catch (error) {
      showNotification("Erreur lors du refus", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (patient: Patient) => {
    setSelectedPatient(patient)
    try {
      const res = await axios.get(`http://localhost:3001/medecin/conversations/${patient.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data)
    } catch (error) {
      showNotification("Erreur lors du chargement des messages", "error")
    }
  }

  const sendMessage = async () => {
    if (!content.trim() || !selectedPatient) return

    try {
      const res = await axios.post(
        "http://localhost:3001/medecin/messages",
        {
          receiverId: selectedPatient.id,
          content,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      socket.emit("send_message", res.data)
      setMessages((prev) => [...prev, res.data])
      setContent("")
    } catch (error) {
      showNotification("Erreur lors de l'envoi du message", "error")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
            notificationType === "success" ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600"
          } text-white px-6 py-4 rounded-lg shadow-xl border-l-4 flex items-center space-x-2`}
        >
          {notificationType === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Header avec bouton retour */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Messagerie Médecin</h1>
                  <p className="text-sm text-gray-600">Gérez vos conversations avec vos patients</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs">En ligne</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Demandes en attente */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <span>Demandes en attente</span>
              {demandes.length > 0 && <Badge className="bg-orange-500 hover:bg-orange-600">{demandes.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {demandes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Aucune demande en attente</p>
                <p className="text-gray-400 text-sm mt-1">Les nouvelles demandes apparaîtront ici</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demandes.map((demande) => (
                  <Card
                    key={demande.id}
                    className="border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50 to-orange-100/50 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-orange-200 text-orange-800 font-semibold">
                            {getInitials(demande.sender.prenom, demande.sender.nom)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {demande.sender.prenom} {demande.sender.nom}
                          </p>
                          <p className="text-sm text-gray-600">Nouvelle demande de contact</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => accepterDemande(demande.sender.id)}
                          disabled={isLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          onClick={() => refuserDemande(demande.sender.id)}
                          disabled={isLoading}
                          variant="destructive"
                          className="flex-1"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interface de messagerie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Liste des patients */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span>Mes patients</span>
                {patients.length > 0 && <Badge variant="secondary">{patients.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[580px] overflow-y-auto">
                {patients.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">Aucun patient</p>
                    <p className="text-gray-400 text-sm mt-1">Les patients acceptés apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => fetchMessages(patient)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          selectedPatient?.id === patient.id ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-sm" : ""
                        }`}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                            {getInitials(patient.prenom, patient.nom)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {patient.prenom} {patient.nom}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Stethoscope className="w-3 h-3 mr-1" />
                            Patient
                          </p>
                        </div>
                        {selectedPatient?.id === patient.id && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Zone de chat */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                {selectedPatient ? (
                  <div className="flex items-center space-x-2">
                    <span>Conversation avec</span>
                    <Badge variant="outline" className="font-normal">
                      {selectedPatient.prenom} {selectedPatient.nom}
                    </Badge>
                  </div>
                ) : (
                  <span>Sélectionnez un patient</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedPatient ? (
                <div className="flex flex-col h-[580px]">
                  {/* Messages */}
                  <div
                    id="chat-messages"
                    className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 to-blue-50/30"
                  >
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Aucun message pour le moment</p>
                        <p className="text-gray-400 text-sm mt-1">Commencez la conversation</p>
                      </div>
                    ) : (
                      messages.map((message, idx) => (
                        <div
                          key={idx}
                          className={`flex ${message.senderRole === "medecin" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                              message.senderRole === "medecin" ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback
                                className={`text-xs ${
                                  message.senderRole === "medecin"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {message.senderRole === "medecin" ? "Dr" : "P"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                message.senderRole === "medecin"
                                  ? "bg-blue-600 text-white rounded-br-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm border"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderRole === "medecin" ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Zone de saisie */}
                  <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
                    <div className="flex space-x-3">
                      <Input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message..."
                        className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!content.trim()}
                        className="bg-blue-600 hover:bg-blue-700 px-6"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[580px]">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-xl font-medium mb-2">Sélectionnez un patient</p>
                    <p className="text-gray-400">Choisissez un patient dans la liste pour commencer la conversation</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
