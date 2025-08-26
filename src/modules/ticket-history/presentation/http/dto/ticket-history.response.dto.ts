import { ApiProperty } from '@nestjs/swagger';

import { DateUtil } from '~/libs/utils/date.util';
import { TicketHistoryPrimitives } from '~/modules/ticket-history/domain/model/ticket-history';

export class TicketHistoryResponseDto {
  @ApiProperty({
    description: '티켓 히스토리 ID',
  })
  id: string;

  @ApiProperty({
    description: '티켓 변동 사유',
  })
  reason: string;

  @ApiProperty({
    description: '티켓 변동량',
  })
  changeAmount: number;

  @ApiProperty({
    description: '티켓 잔여량',
  })
  resultAmount: number;

  createdAt: string;

  static fromPrimitives(primitives: TicketHistoryPrimitives): TicketHistoryResponseDto {
    return {
      id: primitives.id,
      reason: primitives.reason,
      changeAmount: primitives.changeAmount,
      resultAmount: primitives.resultAmount,
      createdAt: DateUtil.format(primitives.createdAt),
    };
  }
}
