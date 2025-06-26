import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ordonnance } from './ordonnance.entity';

@Injectable()
export class OrdonnancesService {
  constructor(
    @InjectRepository(Ordonnance)
    private readonly ordonnanceRepository: Repository<Ordonnance>,
  ) {}

  // 🔍 Lister toutes les ordonnances
  findAll(): Promise<Ordonnance[]> {
    return this.ordonnanceRepository.find({
      relations: ['patient', 'medecin'],
      order: { date: 'DESC' },
    });
  }

  // 🔍 Récupérer une ordonnance par ID
  async findOne(id: number): Promise<Ordonnance> {
    const ordonnance = await this.ordonnanceRepository.findOne({
      where: { id },
      relations: ['patient', 'medecin'],
    });

    if (!ordonnance) {
      throw new NotFoundException('Ordonnance non trouvée');
    }

    return ordonnance;
  }

  // ➕ Créer une ordonnance
  create(data: Partial<Ordonnance>): Promise<Ordonnance> {
    const ordonnance = this.ordonnanceRepository.create(data);
    return this.ordonnanceRepository.save(ordonnance);
  }

  // 🗑️ Supprimer une ordonnance
  async delete(id: number) {
    const found = await this.ordonnanceRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException('Ordonnance non trouvée');
    }
    await this.ordonnanceRepository.remove(found);
    return { message: 'Ordonnance supprimée' };
  }
}
