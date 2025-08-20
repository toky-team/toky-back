import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateGiftRequestDto {
  @ApiPropertyOptional({
    description: '경품 이름',
    example: '아이폰 16 프로',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: '경품 별칭',
    example: '아이폰',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  alias?: string;

  @ApiPropertyOptional({
    description: '필요한 티켓 수',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  requiredTicket?: number;
}

export class UpdateGiftWithImageDto extends UpdateGiftRequestDto {
  @ApiPropertyOptional({
    description: '경품 이미지 (JPG, PNG, WEBP만 허용, 최대 5MB)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  image?: Express.Multer.File;
}
