import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { PaginatedResultDtoFactory } from '~/libs/interfaces/cursor-pagination/paginated-result.dto';
import { TicketHistoryFacade } from '~/modules/ticket-history/application/port/in/ticket-history-facade.port';
import { GetTicketHistoriesRequestDto } from '~/modules/ticket-history/presentation/http/dto/get-histories.request.dto';
import { TicketHistoryResponseDto } from '~/modules/ticket-history/presentation/http/dto/ticket-history.response.dto';

const TicketHistoryPaginatedResultDto = PaginatedResultDtoFactory(
  TicketHistoryResponseDto,
  'TicketHistoryPaginatedResultDto'
);

@Controller('ticket-history')
export class TicketHistoryController {
  constructor(private readonly ticketHistoryFacade: TicketHistoryFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '티켓 히스토리 조회',
    description: '사용자의 티켓 히스토리를 조회합니다. 커서기반 페이징을 지원합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '티켓 히스토리 조회 성공',
    type: TicketHistoryPaginatedResultDto,
  })
  async getTicketHistories(
    @Query() dto: GetTicketHistoriesRequestDto,
    @Req() req: AuthenticatedRequest
  ): Promise<PaginatedResult<TicketHistoryResponseDto>> {
    const { cursor, limit } = dto;
    const userId = req.user.userId;
    const histories = await this.ticketHistoryFacade.getTicketHistoriesByUserIdWithCursor(userId, {
      cursor,
      limit,
    });
    return {
      ...histories,
      items: histories.items.map((item) => TicketHistoryResponseDto.fromPrimitives(item)),
    };
  }
}
