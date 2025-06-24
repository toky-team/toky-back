import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { RedisConfig } from '~/configs/redis.config';
import { DateUtil } from '~/libs/utils/date.util';

@Injectable()
export class AppService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisConfig: RedisConfig
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const healthStatus: HealthCheckResult = {
      status: 'ok',
      timestamp: DateUtil.formatDate(DateUtil.now()),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
      services: {
        database: 'connected',
        redis: 'connected',
      },
    };

    try {
      await this.checkDatabase();
    } catch {
      healthStatus.status = 'degraded';
      healthStatus.services.database = 'disconnected';
    }
    try {
      await this.checkRedis();
    } catch {
      healthStatus.status = 'degraded';
      healthStatus.services.redis = 'disconnected';
    }

    return healthStatus;
  }

  private async checkDatabase(): Promise<void> {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('데이터베이스 연결에 실패했습니다. 데이터베이스가 실행 중인지 확인하세요.');
    }
  }

  private async checkRedis(): Promise<void> {
    try {
      const redisClient = this.redisConfig.createRedisClient();
      await redisClient.ping();
      redisClient.quit();
    } catch {
      throw new ServiceUnavailableException('Redis 연결에 실패했습니다. Redis 서버가 실행 중인지 확인하세요.');
    }
  }
}

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
  };
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    [key: string]: string;
  };
}
