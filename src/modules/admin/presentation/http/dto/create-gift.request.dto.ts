import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateGiftRequestDto {
  @ApiProperty({
    description: '경품 이름',
    example: '아이폰 16 프로',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: '경품 별칭',
    example: '아이폰',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  alias: string;

  @ApiProperty({
    description: '필요한 티켓 수',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  requiredTicket: number;
}

export class CreateGiftWithImageDto extends CreateGiftRequestDto {
  @ApiProperty({
    description: '경품 이미지 (JPG, PNG, WEBP만 허용, 최대 5MB)',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;
}
