// src/rendezvous/dto/create-rendezvous.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateRendezvousDto {
  @IsNotEmpty()
  nom: string;

  @IsNotEmpty()
  prenom: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  heure: string;

  @IsNotEmpty()
  motif: string;

  @IsNotEmpty()
  medecin: string; // ID du médecin
}
