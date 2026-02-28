import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsObject, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileChangeDto {
  @ApiProperty({ example: { bio: 'Updated bio text' } })
  @IsObject()
  @IsNotEmpty()
  requestedChanges!: Record<string, any>;

  @ApiProperty({ example: 'I want to update my bio to reflect my recent certification', minLength: 10, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  reason!: string;
}

export class ReviewProfileChangeDto {
  @ApiPropertyOptional({ example: 'Approved - certification verified', maxLength: 1000 })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class ProfileChangeQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected'] })
  status?: string;

  @ApiPropertyOptional()
  teacherId?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  limit?: number;
}
