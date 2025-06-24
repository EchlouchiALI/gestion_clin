import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class RegisterPatientDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsNumber()
  age: number;

  @IsString()
  @IsNotEmpty()
  lieuNaissance: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
