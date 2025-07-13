// src/app/dashboard/patient/ordonnances/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, UploadCloud } from "lucide-react";

export default function AnalyseOrdonnancePage() {
  const [file, setFile] = useState<File | null>(null);
  const [texte, setTexte] = useState<string>("");
  const [resultat, setResultat] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const envoyerFichier = async () => {
    if (!file) return alert("Veuillez choisir un fichier.");
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      setTexte("");
      setResultat("");
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3001/patient/ordonnances/analyse",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTexte(res.data.texte);
      setResultat(res.data.reponse);
    } catch (err: any) {
      alert("Erreur lors de l'analyse : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="w-6 h-6" /> Analyse d'Ordonnance IA
      </h1>

      <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

      <Button onClick={envoyerFichier} disabled={loading || !file} className="flex gap-2">
        <UploadCloud className="w-4 h-4" />
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" /> En cours...
          </>
        ) : (
          "Analyser"
        )}
      </Button>

      {texte && (
        <div>
          <h2 className="font-semibold">Texte extrait :</h2>
          <Textarea readOnly value={texte} className="min-h-[120px]" />
        </div>
      )}

      {resultat && (
        <div>
          <h2 className="font-semibold">Analyse IA :</h2>
          <Textarea readOnly value={resultat} className="min-h-[160px] text-green-800" />
        </div>
      )}
    </div>
  );
}
