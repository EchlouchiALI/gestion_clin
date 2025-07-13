import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreatePatientDto {
  @IsNotEmpty()
  nom: string

  @IsNotEmpty()
  prenom: string

  @IsEmail()
  email: string

  @IsOptional()
  telephone?: string

  @IsOptional()
  sexe?: string

  @IsOptional()
  dateNaissance?: string

  @IsOptional()
  lieuNaissance?: string

  @IsOptional()
  password?: string

  // ✅ Champs médicaux
  @IsOptional()
  @IsString()
  maladiesConnues?: string

  @IsOptional()
  @IsString()
  traitementsEnCours?: string

  @IsOptional()
  @IsString()
  allergies?: string

  @IsOptional()
  @IsString()
  antecedentsMedicaux?: string
}
