import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min, ValidateIf } from 'class-validator';

export class GetTicketHistoriesRequestDto {
  @ApiProperty({
    description: '조회 커서',
    required: false,
  })
  @ValidateIf((o: GetTicketHistoriesRequestDto) => o.cursor !== undefined)
  @IsString()
  @IsNotEmpty()
  cursor?: string;

  @ApiProperty({
    description: '조회 개수',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  limit: number;
}
