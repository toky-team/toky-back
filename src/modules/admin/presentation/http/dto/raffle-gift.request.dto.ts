import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RaffleGiftRequestDto {
  @ApiProperty({
    description: '추첨 인원 수',
    example: 3,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  raffleCount: number;

  @ApiPropertyOptional({
    description: '제외할 응모 ID 목록',
    example: ['drawId1', 'drawId2'],
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  excludeDrawIds?: string[];

  @ApiPropertyOptional({
    description: '관리자 포함 여부',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeAdmin?: boolean;
}
