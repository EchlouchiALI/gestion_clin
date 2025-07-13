import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateOrdonnanceDto {
  @IsNotEmpty()
  @IsNumber()
  patientId: number;

  @IsNotEmpty()
  @IsString()
  contenu: string;

  // Champs supplémentaires pour le traitement médical
  @IsOptional()
  @IsString()
  traitements?: string;

  @IsOptional()
  @IsString()
  duree?: string;

  @IsOptional()
  @IsString()
  analyses?: string;

  // Champs pour les ordonnances personnalisées
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @IsString()
  poids?: string;

  @IsOptional()
  @IsString()
  medicaments?: string;

  @IsOptional()
  @IsString()
  recommandations?: string;
}
