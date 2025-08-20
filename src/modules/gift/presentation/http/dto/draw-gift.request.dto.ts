import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class DrawGiftRequestDto {
  @ApiProperty({
    description: '응모 횟수',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  count: number;
}
