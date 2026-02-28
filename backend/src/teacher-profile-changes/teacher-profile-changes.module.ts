import { Module } from '@nestjs/common';
import { TeacherProfileChangesController } from './teacher-profile-changes.controller';
import { TeacherProfileChangesService } from './teacher-profile-changes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherProfileChangesController],
  providers: [TeacherProfileChangesService],
  exports: [TeacherProfileChangesService],
})
export class TeacherProfileChangesModule {}
