"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import io from "socket.io-client"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, MessageCircle, Clock, Search } from "lucide-react"

const socket = io("http://localhost:3001", { autoConnect: false })

type Medecin = {
  id: number
  nom: string
  prenom: string
  specialite: string
}

type Message = {
  id: number
  content: string
  senderRole: string
  createdAt: string
}

export default function PatientConversationsPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    axios
      .get("http://localhost:3001/patient/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMedecins(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erreur:", err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    socket.connect()
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg])
    })
    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchConversation = async (medecin: Medecin) => {
    const token = localStorage.getItem("token")
    setSelectedMedecin(medecin)
    try {
      const res = await axios.get(`http://localhost:3001/patient/messages/${medecin.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data)
    } catch (err) {
      console.error("Erreur:", err)
    }
  }

  const sendMessage = async () => {
    if (!content.trim() || !selectedMedecin) return
    const token = localStorage.getItem("token")
    const payload = {
      receiverId: selectedMedecin.id,
      content: content.trim(),
    }
    try {
      const res = await axios.post("http://localhost:3001/patient/messages", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      socket.emit("send_message", res.data)
      setMessages((prev) => [...prev, res.data])
      setContent("")
    } catch (err) {
      console.error("Erreur:", err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredMedecins = medecins.filter(
    (medecin) =>
      `${medecin.prenom} ${medecin.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getRandomColor = (id: number) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
    ]
    return colors[id % colors.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header moderne */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-white/80 backdrop-blur-sm border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Mes Conversations
              </h1>
              <p className="text-slate-600 text-sm">Communiquez avec vos médecins en temps réel</p>
            </div>
          </div>
        </div>

        {/* Interface de chat moderne */}
        <div
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          style={{ height: "calc(100vh - 180px)" }}
        >
          <div className="flex h-full">
            {/* Sidebar des médecins */}
            <div className="w-full lg:w-80 border-r border-slate-200/50 bg-white/50 backdrop-blur-sm flex flex-col">
              {/* Header sidebar */}
              <div className="p-4 border-b border-slate-200/50">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Médecins
                  </h2>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                    {medecins.length}
                  </span>
                </div>

                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un médecin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Liste des médecins */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-slate-600 text-sm">Chargement des conversations...</p>
                  </div>
                ) : filteredMedecins.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">Aucune conversation</p>
                    <p className="text-slate-500 text-sm mt-1">Contactez un médecin pour commencer</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredMedecins.map((medecin) => (
                      <div
                        key={medecin.id}
                        onClick={() => fetchConversation(medecin)}
                        className={`p-3 cursor-pointer rounded-xl mb-2 transition-all duration-200 hover:bg-white/80 hover:shadow-sm ${
                          selectedMedecin?.id === medecin.id ? "bg-blue-50 ring-2 ring-blue-500/20 shadow-sm" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-12 h-12 ${getRandomColor(medecin.id)} rounded-full flex items-center justify-center text-white font-semibold shadow-lg`}
                            >
                              {getInitials(medecin.prenom, medecin.nom)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">
                              Dr {medecin.prenom} {medecin.nom}
                            </h3>
                            <p className="text-sm text-slate-600 truncate">{medecin.specialite}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">En ligne</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Zone de chat */}
            <div className="flex-1 flex flex-col min-w-0">
              {selectedMedecin ? (
                <>
                  {/* Header du chat */}
                  <div className="p-4 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${getRandomColor(selectedMedecin.id)} rounded-full flex items-center justify-center text-white font-semibold shadow-lg`}
                      >
                        {getInitials(selectedMedecin.prenom, selectedMedecin.nom)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Dr {selectedMedecin.prenom} {selectedMedecin.nom}
                        </h3>
                        <p className="text-sm text-slate-600">{selectedMedecin.specialite}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="w-10 h-10 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-700 mb-2">Commencez la conversation</h3>
                          <p className="text-slate-500">
                            Envoyez votre premier message à Dr {selectedMedecin.prenom} {selectedMedecin.nom}
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, idx) => (
                        <div
                          key={idx}
                          className={`flex ${message.senderRole === "patient" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                        >
                          <div
                            className={`flex items-end gap-2 max-w-xs lg:max-w-md ${message.senderRole === "patient" ? "flex-row-reverse" : ""}`}
                          >
                            {message.senderRole !== "patient" && (
                              <div
                                className={`w-8 h-8 ${getRandomColor(selectedMedecin.id)} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                              >
                                {getInitials(selectedMedecin.prenom, selectedMedecin.nom)}
                              </div>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                message.senderRole === "patient"
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md"
                                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <div
                                className={`flex items-center gap-1 mt-2 ${message.senderRole === "patient" ? "justify-end" : ""}`}
                              >
                                <Clock className="w-3 h-3 opacity-60" />
                                <span className="text-xs opacity-60">
                                  {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Zone de saisie moderne */}
                  <div className="p-4 border-t border-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 relative">
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          onKeyPress={handleKeyPress}
                          rows={1}
                          className="w-full resize-none border border-slate-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white/80 backdrop-blur-sm"
                          placeholder="Tapez votre message..."
                          style={{ minHeight: "48px", maxHeight: "120px" }}
                        />
                      </div>
                      <Button
                        onClick={sendMessage}
                        disabled={!content.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-blue-50/50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Sélectionnez une conversation</h3>
                    <p className="text-slate-500 max-w-sm">
                      Choisissez un médecin dans la liste pour commencer à discuter et obtenir des conseils médicaux
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
