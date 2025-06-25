import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Medecin } from './medecin.entity';

@Injectable()
export class MedecinsService {
  constructor(
    @InjectRepository(Medecin)
    private medecinRepository: Repository<Medecin>,
  ) {}

  // 📋 Liste de tous les médecins
  findAll(): Promise<Medecin[]> {
    return this.medecinRepository.find();
  }

  // 🔍 Trouver un médecin par ID
  async findOne(id: number): Promise<Medecin> {
    const medecin = await this.medecinRepository.findOne({ where: { id } });
    if (!medecin) throw new NotFoundException('Médecin non trouvé');
    return medecin;
  }

  // ➕ Créer un médecin
  create(data: Partial<Medecin>): Promise<Medecin> {
    const medecin = this.medecinRepository.create(data);
    return this.medecinRepository.save(medecin);
  }

  // 🗑️ Supprimer un médecin
  async delete(id: number): Promise<void> {
    const result = await this.medecinRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Médecin non trouvé');
  }

  // 🔍 Rechercher des médecins par nom ou spécialité
  async search(filters: { nom?: string; specialite?: string }): Promise<Medecin[]> {
    const where: any = {};
    if (filters.nom) where.nom = Like(`%${filters.nom}%`);
    if (filters.specialite) where.specialite = Like(`%${filters.specialite}%`);
    return this.medecinRepository.find({ where });
  }

  // ✏️ Mettre à jour un médecin
  async update(id: number, data: Partial<Medecin>): Promise<Medecin> {
    const medecin = await this.medecinRepository.findOneBy({ id });
    if (!medecin) throw new NotFoundException('Médecin non trouvé');

    Object.assign(medecin, data);
    return this.medecinRepository.save(medecin);
  }
}
