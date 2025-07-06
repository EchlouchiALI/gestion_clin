import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivityService } from './activity.service';
import { ActivitiesController } from './activity.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  providers: [ActivityService],
  controllers: [ActivitiesController], 
  exports: [ActivityService],
})
export class ActivityModule {}
