import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePatientDto {
  @IsNotEmpty()
  nom: string;

  @IsNotEmpty()
  prenom: string;

  @IsEmail()
  email: string;

  @IsOptional()
  telephone?: string;

  @IsOptional()
  sexe?: string; // ✅ Une seule fois

  @IsOptional()
  dateNaissance?: string;

  @IsOptional()
  password?: string; // ← utile plus tard si tu veux générer un mot de passe
}
