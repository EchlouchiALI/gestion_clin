"use client";

import { useState } from "react";
import axios from "axios";

export default function OrdonnancesPatientPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return alert("Veuillez choisir un fichier PDF");

    const token = localStorage.getItem("token");
    if (!token) return alert("Utilisateur non authentifié");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3001/patient/ordonnances",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(res.data.explanation);
    } catch (error) {
      console.error("Erreur lors de l’analyse IA :", error);
      alert("Erreur 500 : Analyse impossible. Vérifie le backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Analyse IA d’une ordonnance</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Analyse en cours..." : "Analyser le PDF"}
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50 whitespace-pre-line">
          <h3 className="font-semibold mb-2">Résultat de l’analyse :</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
