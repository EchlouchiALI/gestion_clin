export class CreateOrdonnanceDto {
    patientId: number;
  
    // Ajoute bien ce champ s'il n'existe pas
    contenu: string;
  
    // Pour les ordonnances personnalisées
    nom?: string;
    age?: string;
    poids?: string;
    medicaments?: string;
    recommandations?: string;
  }
  