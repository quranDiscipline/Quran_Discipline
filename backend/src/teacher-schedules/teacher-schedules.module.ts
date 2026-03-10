import { Module } from '@nestjs/common';
import { TeacherSchedulesService } from './teacher-schedules.service';
import { TeacherSchedulesController, BlockedDatesController } from './teacher-schedules.controller';

@Module({
  controllers: [TeacherSchedulesController, BlockedDatesController],
  providers: [TeacherSchedulesService],
  exports: [TeacherSchedulesService],
})
export class TeacherSchedulesModule {}
