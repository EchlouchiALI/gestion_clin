"use client"

import axios from "axios"
import { jwtDecode } from "jwt-decode"

import { useEffect, useState } from "react"
import { Calendar, Clock, FileText, Plus, Search, Stethoscope, User, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'


type Patient = {
  id: string
  nom: string
  prenom: string
  age: number
  telephone: string
  email: string
  dateNaissance: string
  dernierVisite?: string
  statut?: "Actif" | "Nouveau" | "Suivi"
}

type RendezVous = {
  id: string
  date: string
  heure: string
  type: "Consultation" | "Contrôle" | "Urgence"
  statut: "Confirmé" | "En attente" | "Annulé" | "Terminé"
  patient: {
    id: string
    nom: string
    prenom: string
  }
  notes?: string
}

type Ordonnance = {
  id: string
  date: string
  patientId: string
  medicaments: {
    nom: string
    posologie: string
    duree: string
  }[]
  instructions: string
}

export default function MedicalDashboard() {
  const { toast } = useToast()
  const [medecinId, setMedecinId] = useState("")
  const [medecinNom, setMedecinNom] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([])
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([])
  const [activeTab, setActiveTab] = useState<"patients" | "rendez-vous" | "ordonnances">("patients")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // États pour les formulaires
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [showNewRdvForm, setShowNewRdvForm] = useState(false)
  const [selectedPatientForRdv, setSelectedPatientForRdv] = useState<string | null>(null)

  // États des formulaires
  const [newPatient, setNewPatient] = useState<Omit<Patient, "id">>({
    nom: "",
    prenom: "",
    age: 0,
    telephone: "",
    email: "",
    dateNaissance: "",
    statut: "Nouveau"
  })

  const [newRdv, setNewRdv] = useState<Omit<RendezVous, "id" | "patient"> & { patientId: string }>({
    date: "",
    heure: "",
    type: "Consultation",
    statut: "Confirmé",
    patientId: "",
    notes: ""
  })

  // Charger les données du médecin
  // Charger les données du médecin
  useEffect(() => {
    const fetchMedecinData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Non authentifié");
  
        const decoded = jwtDecode<{ sub: string; nom: string; prenom: string }>(token);
        setMedecinId(decoded.sub);
        setMedecinNom(`Dr. ${decoded.prenom} ${decoded.nom}`);
  
        // ✅ Patients
        const patientsRes = await axios.get(`http://localhost:3001/medecin/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(patientsRes.data);
  
        // ✅ Rendez-vous
        const rdvRes = await axios.get(`http://localhost:3001/medecin/rendezvous`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRendezVous(rdvRes.data);
  
        // ✅ Ordonnances
        const ordonnancesRes = await axios.get(`http://localhost:3001/medecin/ordonnances`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrdonnances(ordonnancesRes.data);
  
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
        setError("Erreur lors du chargement des données");
        setLoading(false);
      }
    };
  
    fetchMedecinData();
  }, []);
  


  const filteredPatients = patients.filter((p) =>
  `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
)
const rdvAujourdhui = rendezVous.filter(
  (rdv) => rdv.date === format(new Date(), 'yyyy-MM-dd')
)


  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Actif":
      case "Confirmé":
      case "Terminé":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
      case "Nouveau":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
      case "Suivi":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs"
      case "En attente":
        return "bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
      case "Annulé":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Non authentifié")

      const response = await axios.post(`/api/medecins/${medecinId}/patients`, newPatient, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setPatients([...patients, response.data])
      setShowNewPatientForm(false)
      setNewPatient({
        nom: "",
        prenom: "",
        age: 0,
        telephone: "",
        email: "",
        dateNaissance: "",
        statut: "Nouveau"
      })

      toast({
        title: "Patient ajouté",
        description: "Le nouveau patient a été enregistré avec succès",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du patient",
        variant: "destructive"
      })
      console.error(error)
    }
  }

  const handleAddRdv = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Non authentifié")

      const response = await axios.post(`/api/medecins/${medecinId}/rendezvous`, newRdv, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setRendezVous([...rendezVous, response.data])
      setShowNewRdvForm(false)
      setNewRdv({
        date: "",
        heure: "",
        type: "Consultation",
        statut: "Confirmé",
        patientId: "",
        notes: ""
      })

      toast({
        title: "Rendez-vous programmé",
        description: "Le nouveau rendez-vous a été enregistré avec succès",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du rendez-vous",
        variant: "destructive"
      })
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Médical</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {medecinNom.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="text-sm font-medium">{medecinNom}</p>
              <p className="text-xs text-gray-500">Médecin généraliste</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Patients Total</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-gray-500">
                {patients.filter(p => p.statut === "Nouveau").length} nouveaux ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">RDV Aujourd'hui</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rdvAujourdhui.length}</div>
              <p className="text-xs text-gray-500">
                {rdvAujourdhui.filter(r => r.statut === "Confirmé").length} confirmés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ordonnances</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordonnances.length}</div>
              <p className="text-xs text-gray-500">Cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20 min</div>
              <p className="text-xs text-gray-500">Par consultation</p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {["patients", "rendez-vous", "ordonnances"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "patients" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Liste des Patients</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Gérez vos patients</p>
                </div>
                <Button onClick={() => setShowNewPatientForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Patient
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {showNewPatientForm && (
                <div className="mb-6 p-4 border rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Ajouter un nouveau patient</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewPatientForm(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleAddPatient} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <Input
                          value={newPatient.nom}
                          onChange={(e) => setNewPatient({...newPatient, nom: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                        <Input
                          value={newPatient.prenom}
                          onChange={(e) => setNewPatient({...newPatient, prenom: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                        <Input
                          type="date"
                          value={newPatient.dateNaissance}
                          onChange={(e) => {
                            const age = new Date().getFullYear() - new Date(e.target.value).getFullYear()
                            setNewPatient({
                              ...newPatient,
                              dateNaissance: e.target.value,
                              age
                            })
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                        <Input
                          type="number"
                          value={newPatient.age}
                          onChange={(e) => setNewPatient({...newPatient, age: parseInt(e.target.value)})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <Input
                          value={newPatient.telephone}
                          onChange={(e) => setNewPatient({...newPatient, telephone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input
                          type="email"
                          value={newPatient.email}
                          onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <Select
                          value={newPatient.statut}
                          onValueChange={(value) => setNewPatient({...newPatient, statut: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nouveau">Nouveau</SelectItem>
                            <SelectItem value="Actif">Actif</SelectItem>
                            <SelectItem value="Suivi">Suivi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowNewPatientForm(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">Enregistrer</Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Patient", "Âge", "Contact", "Dernière visite", "Statut", "Actions"].map((col) => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                {patient.nom[0]}{patient.prenom[0]}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{patient.nom} {patient.prenom}</div>
                                <div className="text-xs text-gray-500">ID: {patient.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{patient.age} ans</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>{patient.telephone}</div>
                            {patient.email && (
                              <div className="text-xs text-gray-500">{patient.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {patient.dernierVisite ? 
                        format(new Date(patient.dernierVisite), 'PPP') 
                        : "--"}
                        </td>
                          <td className="px-6 py-4">
                            <span className={getStatusColor(patient.statut || "Actif")}>
                              {patient.statut || "Actif"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedPatientForRdv(patient.id)
                                setNewRdv({
                                  ...newRdv,
                                  patientId: patient.id
                                })
                                setShowNewRdvForm(true)
                              }}
                            >
                              Prendre RDV
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucun patient trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "rendez-vous" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rendez-vous</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Gérez votre agenda</p>
                </div>
                <Button onClick={() => setShowNewRdvForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau RDV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNewRdvForm && (
                <div className="mb-6 p-4 border rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Programmer un rendez-vous</h3>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setShowNewRdvForm(false)
                      setSelectedPatientForRdv(null)
                    }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleAddRdv} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                        <Select
                          value={newRdv.patientId}
                          onValueChange={(value) => setNewRdv({...newRdv, patientId: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.nom} {patient.prenom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <Input
                          type="date"
                          value={newRdv.date}
                          onChange={(e) => setNewRdv({...newRdv, date: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                        <Input
                          type="time"
                          value={newRdv.heure}
                          onChange={(e) => setNewRdv({...newRdv, heure: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <Select
                          value={newRdv.type}
                          onValueChange={(value) => setNewRdv({...newRdv, type: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Consultation">Consultation</SelectItem>
                            <SelectItem value="Contrôle">Contrôle</SelectItem>
                            <SelectItem value="Urgence">Urgence</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <Select
                          value={newRdv.statut}
                          onValueChange={(value) => setNewRdv({...newRdv, statut: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Confirmé">Confirmé</SelectItem>
                            <SelectItem value="En attente">En attente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <Textarea
                          value={newRdv.notes}
                          onChange={(e) => setNewRdv({...newRdv, notes: e.target.value})}
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setShowNewRdvForm(false)
                        setSelectedPatientForRdv(null)
                      }}>
                        Annuler
                      </Button>
                      <Button type="submit">Programmer</Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Patient", "Date", "Heure", "Type", "Statut", "Actions"].map((col) => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rendezVous.length > 0 ? (
                      [...rendezVous]
                        .sort((a, b) => new Date(`${a.date}T${a.heure}`).getTime() - new Date(`${b.date}T${b.heure}`).getTime())
                        .map((rdv) => (
                          <tr key={rdv.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                  {rdv.patient.nom[0]}{rdv.patient.prenom[0]}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {rdv.patient.nom} {rdv.patient.prenom}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                            {format(new Date(rdv.date), 'PPP', { locale: fr })}
</td>


                            <td className="px-6 py-4 text-sm text-gray-900">{rdv.heure}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{rdv.type}</td>
                            <td className="px-6 py-4">
                              <span className={getStatusColor(rdv.statut)}>
                                {rdv.statut}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button variant="ghost" size="sm">
                                Détails
                              </Button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucun rendez-vous programmé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "ordonnances" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Ordonnances</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Historique des prescriptions</p>
                </div>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle ordonnance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Patient", "Date", "Médicaments", "Actions"].map((col) => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordonnances.length > 0 ? (
                      ordonnances.map((ordonnance) => {
                        const patient = patients.find(p => p.id === ordonnance.patientId)
                        return (
                          <tr key={ordonnance.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {patient ? (
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                    {patient.nom[0]}{patient.prenom[0]}
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {patient.nom} {patient.prenom}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">Patient inconnu</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {format(new Date(ordonnance.date), 'PPP', { locale: fr })}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="space-y-1">
                                {ordonnance.medicaments.map((med, i) => (
                                  <div key={i}>
                                    <span className="font-medium">{med.nom}</span>: {med.posologie} ({med.duree})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button variant="ghost" size="sm">
                                Imprimer
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucune ordonnance enregistrée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}