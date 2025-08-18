import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { AttendanceFacade } from '~/modules/attendance/application/port/in/attendance-facade.port';
import { AllAttendanceResponseDto } from '~/modules/attendance/presentation/http/dto/all-attendance.response.dto';
import { AttendanceResponseDto } from '~/modules/attendance/presentation/http/dto/attendance.response.dto';
import { CompleteGameRequestDto } from '~/modules/attendance/presentation/http/dto/complete-game.request.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceFacade: AttendanceFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '오늘의 출석 정보 조회',
    description: '사용자의 오늘 출석 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘의 출석 정보 조회 성공',
    type: AttendanceResponseDto,
  })
  async getTodayAttendance(@Req() req: AuthenticatedRequest): Promise<AttendanceResponseDto> {
    const attendance = await this.attendanceFacade.getTodayAttendanceByUserId(req.user.userId);
    return AttendanceResponseDto.fromPrimitives(attendance);
  }

  @Get('/all')
  @ApiOperation({
    summary: '모든 출석 정보 조회',
    description: '사용자의 모든 출석 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '출석 정보 조회 성공',
    type: AllAttendanceResponseDto,
  })
  async getAllAttendances(@Req() req: AuthenticatedRequest): Promise<AllAttendanceResponseDto> {
    const attendances = await this.attendanceFacade.getAttendancesByUserId(req.user.userId);
    return AllAttendanceResponseDto.fromResult(attendances);
  }

  @Post('/game/start')
  @ApiOperation({
    summary: '출석 게임 시작',
    description: '사용자가 출석 게임을 시작합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '출석 게임 시작 성공',
  })
  async startAttendanceGame(@Req() req: AuthenticatedRequest): Promise<void> {
    await this.attendanceFacade.startGame(req.user.userId);
  }

  @Post('/game/complete')
  @ApiOperation({
    summary: '출석 게임 완료',
    description: '사용자가 출석 게임을 완료합니다.',
  })
  @ApiBody({
    type: CompleteGameRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '출석 게임 완료 성공',
  })
  async completeAttendanceGameStep1(
    @Req() req: AuthenticatedRequest,
    @Body() body: CompleteGameRequestDto
  ): Promise<void> {
    await this.attendanceFacade.completeStage(req.user.userId, body.stage, body.win);
  }

  @Post('/share')
  @ApiOperation({
    summary: '출석 게임 공유',
    description: '공유를 통해 출석 게임을 재도전할 수 있는 기회를 부여합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '출석 게임 재도전 기회 부여 성공',
  })
  async getAnotherChance(@Req() req: AuthenticatedRequest): Promise<void> {
    await this.attendanceFacade.getAnotherChance(req.user.userId);
  }
}
