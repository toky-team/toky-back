import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
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
  @Public()
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
}
