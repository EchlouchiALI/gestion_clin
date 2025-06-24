export class UpdateRendezvousDto {
    patientId?: number;
    medecinId?: number;
    date?: string;
    heure?: string;
    motif?: string;
    statut?: 'à venir' | 'passé' | 'annulé';
  }
  