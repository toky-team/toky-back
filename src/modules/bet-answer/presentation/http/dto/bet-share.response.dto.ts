import { ApiProperty } from '@nestjs/swagger';

export class BetShareResponseDto {
  @ApiProperty({
    description: '오늘의 첫 공유인지 여부, (응모권 지급 여부와 동일)',
    example: true,
  })
  isFirstShared: boolean;
}
