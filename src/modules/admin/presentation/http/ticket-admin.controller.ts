import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IncrementTicketRequestDto } from '~/modules/admin/presentation/http/dto/increment-ticket.request.dto';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { TicketInvoker } from '~/modules/ticket/application/port/in/ticket-invoker.port';

@Controller('/admin/ticket')
@ApiTags('Ticket')
@UseGuards(AdminGuard)
export class TicketAdminController {
  constructor(private readonly ticketInvoker: TicketInvoker) {}

  @Post('/increment')
  @ApiOperation({
    summary: '응모권 지급',
    description: '관리자가 사용자에게 응모권을 지급합니다.',
  })
  @ApiBody({
    type: IncrementTicketRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '응모권 지급 성공',
  })
  async incrementTicketCount(@Body() body: IncrementTicketRequestDto): Promise<void> {
    const { userId, count, reason } = body;
    await this.ticketInvoker.incrementTicketCount(userId, count, reason);
  }
}
