import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { LiveUrlPrimitives } from '~/modules/live-url/domain/model/live-url';

export class LiveUrlResponseDto {
  @ApiProperty({
    description: '라이브 URL ID',
  })
  id: string;

  @ApiProperty({
    description: '스포츠 종류',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description: '방송사 이름',
  })
  broadcastName: string;

  @ApiProperty({
    description: '방송 URL',
  })
  url: string;

  public static fromPrimitives(primitives: LiveUrlPrimitives): LiveUrlResponseDto {
    const dto = new LiveUrlResponseDto();
    dto.id = primitives.id;
    dto.sport = primitives.sport;
    dto.broadcastName = primitives.broadcastName;
    dto.url = primitives.url;
    return dto;
  }
}
