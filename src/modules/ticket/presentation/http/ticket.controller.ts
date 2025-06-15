import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { TicketFacade } from '~/modules/ticket/application/port/in/ticket-facade.port';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketFacade: TicketFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '티켓 카운트 조회',
    description: '로그인한 사용자의 티켓 카운트를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '티켓 카운트 조회 성공',
    type: Number,
  })
  async getTicketCount(@Req() req: AuthenticatedRequest): Promise<number> {
    const { user } = req;

    return this.ticketFacade.getTicketCountByUserId(user.userId);
  }
}
