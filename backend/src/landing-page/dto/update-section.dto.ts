import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class UpdateSectionDto {
  @ApiProperty({
    description: 'The content JSON for this section',
    example: {
      headline: 'Master the Quran Through Discipline',
      subheadline: 'Al-Azhar trained teachers. Proven system. Real accountability.',
    },
  })
  @IsObject()
  @IsNotEmpty()
  contentJson!: Record<string, any>;
}
