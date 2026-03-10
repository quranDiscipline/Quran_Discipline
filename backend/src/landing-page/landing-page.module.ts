import { Module } from '@nestjs/common';
import { LandingPageController, AdminLandingPageController } from './landing-page.controller';
import { LandingPageService } from './landing-page.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LandingPageController, AdminLandingPageController],
  providers: [LandingPageService],
  exports: [LandingPageService],
})
export class LandingPageModule {}
