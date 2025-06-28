// src/patient/dto/create-patient.dto.ts
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePatientDto {
  @IsNotEmpty({ message: 'Le nom est requis.' })
  nom: string;

  @IsNotEmpty({ message: 'Le prénom est requis.' })
  prenom: string;

  @IsEmail({}, { message: 'Email invalide.' })
  email: string;

  @IsOptional()
  telephone?: string;

  @IsOptional()
  dateNaissance?: string;
}
