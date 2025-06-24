'use client';

import { useEffect, useState } from 'react';
import { Calendar, FolderOpen } from 'lucide-react';

export default function PatientDashboard() {
  const [patientName, setPatientName] = useState('Cher patient');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = JSON.parse(atob(token.split('.')[1]));
        setPatientName(decoded.nom || 'Cher patient');
      } catch (err) {
        console.error('Erreur décodage token:', err);
      }
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-3xl w-full p-6 bg-white rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">👋 Bienvenue, {patientName}</h2>

        <section className="space-y-4">
          <div className="p-4 border rounded-lg bg-blue-50 flex items-center gap-4">
            <Calendar className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Prochain rendez-vous</p>
              <p className="text-md font-semibold text-gray-700">Lundi 24 Juin à 14h</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-green-50 flex items-center gap-4">
            <FolderOpen className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Mes dossiers médicaux</p>
              <button className="text-green-700 hover:underline font-medium">
                Voir les dossiers
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
