import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { CheerFacade } from '~/modules/cheer/application/port/in/cheer-facade.port';
import { CheerRequestDto } from '~/modules/cheer/presentation/http/dto/cheer.request.dto';
import { CheerResponseDto } from '~/modules/cheer/presentation/http/dto/cheer.resposne.dto';
import { CheerCountResponseDto } from '~/modules/cheer/presentation/http/dto/cheer-count.response.dto';

@Controller('cheer')
export class CheerController {
  constructor(private readonly cheerFacade: CheerFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '응원 조회',
    description: '로그인한 사용자의 응원 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '응원 정보 조회 성공',
    type: CheerResponseDto,
  })
  async getCheer(@Req() req: AuthenticatedRequest): Promise<CheerResponseDto> {
    const cheer = await this.cheerFacade.getCheerByUserId(req.user.userId);
    return CheerResponseDto.fromPrimitives(cheer);
  }

  @Get('/count')
  @ApiOperation({
    summary: '응원 통계 조회',
    description: '대학교별 응원 수를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '응원 통계 조회 성공',
    type: CheerCountResponseDto,
  })
  @Public()
  async getCheerCount(): Promise<CheerCountResponseDto> {
    const cheerCount = await this.cheerFacade.countWithUniversity();
    return CheerCountResponseDto.fromResult(cheerCount);
  }

  @Post('/')
  @ApiOperation({
    summary: '응원 등록',
    description: '사용자가 응원하는 대학교 정보를 등록합니다. 이미 존재할 경우 응원을 수정합니다.',
  })
  @ApiBody({
    type: CheerRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '응원 정보 등록 성공',
    type: CheerResponseDto,
  })
  async createOrUpdateCheer(
    @Req() req: AuthenticatedRequest,
    @Body() body: CheerRequestDto
  ): Promise<CheerResponseDto> {
    const cheer = await this.cheerFacade.createOrUpdateCheer(req.user.userId, body.university);
    return CheerResponseDto.fromPrimitives(cheer);
  }
}
