// activities.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async findAll() {
    return this.activityService.findAll();
  }
}
