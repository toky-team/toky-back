import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLiveUrlRequestDto {
  @ApiPropertyOptional({
    description: '방송사 이름',
    example: 'KUBS',
  })
  @IsOptional()
  @IsString()
  broadcastName?: string;

  @ApiPropertyOptional({
    description: '방송 URL',
    example: 'https://example.com/live',
  })
  @IsOptional()
  @IsString()
  url?: string;
}
