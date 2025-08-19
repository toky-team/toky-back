import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { PlayerFacade } from '~/modules/player/application/port/in/player-facade.port';
import { GetPlayersRequestQueryDto } from '~/modules/player/presentation/http/dto/get-players.request.dto';
import { PlayerResponseDto } from '~/modules/player/presentation/http/dto/player.response.dto';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerFacade: PlayerFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '선수 목록 조회',
    description: '필터에 따라 등록된 선수 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '선수 목록 조회 성공',
    type: [PlayerResponseDto],
  })
  @Public({
    includeCredential: true,
  })
  async getPlayers(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetPlayersRequestQueryDto
  ): Promise<PlayerResponseDto[]> {
    const { university, sport, position } = query;
    const userId = req.user ? req.user.userId : undefined;
    const players = await this.playerFacade.getPlayersByFilter(university, sport, position, userId);
    return players.map((player) => PlayerResponseDto.fromResult(player));
  }

  @Get('/:id')
  @ApiOperation({
    summary: '선수 정보 조회',
    description: '선수 ID에 해당하는 선수의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '선수 정보 조회 성공',
    type: PlayerResponseDto,
  })
  @Public()
  async getPlayerById(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<PlayerResponseDto> {
    const userId = req.user ? req.user.userId : undefined;
    const player = await this.playerFacade.getPlayerById(id, userId);
    return PlayerResponseDto.fromResult(player);
  }

  @Post('/:id/like')
  @ApiOperation({
    summary: '선수 좋아요',
    description: '선수 ID에 해당하는 선수에게 좋아요를 추가합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '선수 좋아요 추가 성공',
  })
  async likePlayer(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.playerFacade.likePlayer(req.user.userId, id);
  }

  @Post('/:id/unlike')
  @ApiOperation({
    summary: '선수 좋아요 취소',
    description: '선수 ID에 해당하는 선수에게 좋아요를 취소합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '선수 좋아요 취소 성공',
  })
  async unlikePlayer(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.playerFacade.unlikePlayer(req.user.userId, id);
  }
}
