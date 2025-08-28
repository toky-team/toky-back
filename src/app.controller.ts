import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { AppService, HealthCheckResult } from '~/app.service';
import { Public } from '~/libs/decorators/public.decorator';
import { getMetricsRegistry } from '~/libs/middlewares/metrics.middleware';

const register = getMetricsRegistry();

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

  @Get('/metrics')
  @ApiOperation({
    summary: '메트릭 정보',
    description: '애플리케이션의 메트릭 정보를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '메트릭 정보 조회 성공',
  })
  @Public()
  @Header('Content-Type', register.contentType)
  @Header('Cache-Control', 'no-cache')
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
