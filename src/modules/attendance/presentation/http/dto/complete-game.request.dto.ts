import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CompleteGameRequestDto {
  @ApiProperty({
    description: '게임 단계(1 or 2)',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(2)
  stage: 1 | 2;

  @ApiProperty({
    description: '게임 승리 여부',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  win: boolean;
}
