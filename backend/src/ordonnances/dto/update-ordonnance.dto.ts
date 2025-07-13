// src/ordonnances/dto/update-ordonnance.dto.ts

export class UpdateOrdonnanceDto {
    patientId?: number;      // optionnel ici
    contenu?: string;
    traitements?: string;
    duree?: string;
    analyses?: string;
  }
  