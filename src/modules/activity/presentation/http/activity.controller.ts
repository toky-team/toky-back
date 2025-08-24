import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { PaginatedResultDtoFactory } from '~/libs/interfaces/cursor-pagination/paginated-result.dto';
import { ActivityFacade } from '~/modules/activity/application/port/in/activity-facade.port';
import { GetRanksRequestDto } from '~/modules/activity/presentation/http/dto/get-ranks.request.dto';
import { ActivityRankResponseDto } from '~/modules/activity/presentation/http/dto/rank.response.dto';

const ActivityRankPaginatedResultDto = PaginatedResultDtoFactory(
  ActivityRankResponseDto,
  'ActivityRankPaginatedResultDto'
);

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityFacade: ActivityFacade) {}

  @Get('/rank')
  @ApiOperation({
    summary: '랭킹 조회',
    description: '전체 활동 랭킹 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '랭킹 조회 성공',
    type: ActivityRankPaginatedResultDto,
  })
  @Public()
  async getRanks(@Query() query: GetRanksRequestDto): Promise<PaginatedResult<ActivityRankResponseDto>> {
    const { cursor, limit } = query;
    const ranks = await this.activityFacade.getRanksWithCursor({
      cursor,
      limit,
    });

    return {
      ...ranks,
      items: ranks.items.map((item) => ActivityRankResponseDto.fromResult(item)),
    };
  }

  @Get('/rank/me')
  @ApiOperation({
    summary: '내 활동 랭킹 조회',
    description: '내 활동 랭킹 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '내 활동 랭킹 조회 성공',
    type: ActivityRankResponseDto,
  })
  async getMyRank(@Req() req: AuthenticatedRequest): Promise<ActivityRankResponseDto> {
    const rank = await this.activityFacade.getRankByUserId(req.user.userId);
    return ActivityRankResponseDto.fromResult(rank);
  }
}
