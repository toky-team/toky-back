import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { PlayerFacade } from '~/modules/player/application/port/in/player-facade.port';
import { GetPlayersRequestQueryDto } from '~/modules/player/presentation/http/dto/get-players.request.dto';
import { PlayerResponseDto } from '~/modules/player/presentation/http/dto/player.response.dto';
import { PlayerLikeRequestDto } from '~/modules/player/presentation/http/dto/player-like.request.dto';

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
  async getPlayers(@Query() query: GetPlayersRequestQueryDto): Promise<PlayerResponseDto[]> {
    const { university, sport, position } = query;
    const players = await this.playerFacade.getPlayersByFilter(university, sport, position);
    return players.map((player) => PlayerResponseDto.fromPrimitives(player));
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
  async getPlayerById(@Param('id') id: string): Promise<PlayerResponseDto> {
    const player = await this.playerFacade.getPlayerById(id);
    return PlayerResponseDto.fromPrimitives(player);
  }

  @Post('/:id/like')
  @ApiOperation({
    summary: '선수 좋아요',
    description: '선수 ID에 해당하는 선수에게 좋아요를 추가합니다.',
  })
  @ApiBody({
    type: PlayerLikeRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '선수 좋아요 추가 성공',
    type: PlayerResponseDto,
  })
  async likePlayer(@Param('id') id: string, @Body() body: PlayerLikeRequestDto): Promise<PlayerResponseDto> {
    await this.playerFacade.likePlayer(id, body.count);
    const player = await this.playerFacade.getPlayerById(id);
    return PlayerResponseDto.fromPrimitives(player);
  }
}
