import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class PlayerLikeRequestDto {
  @ApiProperty({
    description: '좋아요 수',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  count: number;
}
