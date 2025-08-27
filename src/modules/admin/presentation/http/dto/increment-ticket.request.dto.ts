import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class IncrementTicketRequestDto {
  @ApiProperty({
    description: '사용자 ID',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: '증가할 응모권 수',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  count: number;

  @ApiProperty({
    description: '사유',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
