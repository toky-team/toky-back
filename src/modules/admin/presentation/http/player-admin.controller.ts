import { Body, Controller, Delete, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  CreatePlayerRequestDto,
  CreatePlayerWithImageDto,
} from '~/modules/admin/presentation/http/dto/create-player.request.dto';
import {
  UpdatePlayerRequestDto,
  UpdatePlayerWithImageDto,
} from '~/modules/admin/presentation/http/dto/update-player.request.dto';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { PlayerInvoker } from '~/modules/player/application/port/in/player-invoker.port';
import { PlayerResponseDto } from '~/modules/player/presentation/http/dto/player.response.dto';

@Controller('/admin/player')
@ApiTags('Player')
@UseGuards(AdminGuard)
export class PlayerAdminController {
  constructor(private readonly playerInvoker: PlayerInvoker) {}

  @Post('/')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '선수 추가',
    description: '새로운 선수를 추가합니다.',
  })
  @ApiBody({
    type: CreatePlayerWithImageDto,
  })
  @ApiResponse({
    status: 201,
    description: '선수 추가 성공',
    type: PlayerResponseDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  async createPlayer(
    @Body() dto: CreatePlayerRequestDto,
    @UploadedFile() image: Express.Multer.File
  ): Promise<PlayerResponseDto> {
    const { name, university, sport, department, birth, height, weight, position, backNumber } = dto;
    const createdPlayer = await this.playerInvoker.createPlayer(
      name,
      university,
      sport,
      department,
      birth,
      height,
      weight,
      position,
      backNumber,
      image
    );

    return PlayerResponseDto.fromPrimitives(createdPlayer);
  }

  @Patch('/:id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '선수 정보 수정',
    description: '기존 선수의 정보를 수정합니다.',
  })
  @ApiBody({
    type: UpdatePlayerWithImageDto,
  })
  @ApiResponse({
    status: 200,
    description: '선수 정보 수정 성공',
    type: PlayerResponseDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  async updatePlayer(
    @Param('id') id: string,
    @Body() dto: UpdatePlayerRequestDto,
    @UploadedFile() image?: Express.Multer.File
  ): Promise<PlayerResponseDto> {
    const { name, university, sport, department, birth, height, weight, position, backNumber } = dto;
    const updatedPlayer = await this.playerInvoker.updatePlayer(
      id,
      name,
      university,
      sport,
      department,
      birth,
      height,
      weight,
      position,
      backNumber,
      image
    );

    return PlayerResponseDto.fromPrimitives(updatedPlayer);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: '선수 삭제',
    description: '기존 선수를 삭제합니다.',
  })
  @ApiResponse({
    status: 204,
    description: '선수 삭제 성공',
  })
  async deletePlayer(@Param('id') id: string): Promise<void> {
    await this.playerInvoker.deletePlayer(id);
  }
}
