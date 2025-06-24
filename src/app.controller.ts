import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { AppService, HealthCheckResult } from '~/app.service';
import { Public } from '~/libs/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  @ApiOperation({
    summary: '헬스 체크',
    description:
      '애플리케이션의 헬스 상태를 확인합니다. 체크 목록 - [TypeORM 데이터베이스 연결, Redis 클라이언트 연결]',
  })
  @ApiResponse({
    status: 200,
    description: '헬스 체크 성공',
  })
  @ApiResponse({
    status: 503,
    description: '헬스 체크 실패',
  })
  @Public()
  async checkHealth(@Res({ passthrough: true }) res: Response): Promise<HealthCheckResult> {
    const result = await this.appService.checkHealth();
    if (result.status !== 'ok') {
      res.status(503);
    }

    return result;
  }
}
