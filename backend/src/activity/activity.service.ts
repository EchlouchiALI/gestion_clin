// activity.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  async findAll() {
    return this.activityRepo.find({
      order: { createdAt: 'DESC' },
      take: 10, // limite à 10 activités récentes
    });
  }
}
