import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { PaginatedResultDtoFactory } from '~/libs/interfaces/cursor-pagination/paginated-result.dto';
import { BetHitFacade } from '~/modules/bet-hit/application/port/in/bet-hit-facade.port';
import { GetBetHitRanksRequestDto } from '~/modules/bet-hit/presentation/http/dto/get-rank.request.dto';
import { BetHitRankResponseDto } from '~/modules/bet-hit/presentation/http/dto/rank.response.dto';

const BetHitRankPaginatedResultDto = PaginatedResultDtoFactory(BetHitRankResponseDto, 'BetHitRankPaginatedResultDto');

@Controller('bet-hit')
export class BetHitController {
  constructor(private readonly betHitFacade: BetHitFacade) {}

  @Get('/rank')
  @ApiOperation({
    summary: '전체 적중률 랭킹 조회',
    description: '전체 적중률 랭킹 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '랭킹 조회 성공',
    type: BetHitRankPaginatedResultDto,
  })
  @Public()
  async getRanks(@Query() query: GetBetHitRanksRequestDto): Promise<PaginatedResult<BetHitRankResponseDto>> {
    const { cursor, limit } = query;
    const ranks = await this.betHitFacade.getRanksWithCursor({
      cursor,
      limit,
    });

    return {
      ...ranks,
      items: ranks.items.map((item) => BetHitRankResponseDto.fromResult(item)),
    };
  }

  @Get('/rank/me')
  @ApiOperation({
    summary: '내 적중률 랭킹 조회',
    description: '내 적중률 랭킹 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '내 적중률 랭킹 조회 성공',
    type: BetHitRankResponseDto,
  })
  async getMyRank(@Req() req: AuthenticatedRequest): Promise<BetHitRankResponseDto> {
    const rank = await this.betHitFacade.getRankByUserId(req.user.userId);
    return BetHitRankResponseDto.fromResult(rank);
  }
}
