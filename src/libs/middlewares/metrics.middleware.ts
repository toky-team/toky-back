// metrics.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import * as client from 'prom-client';

/**
 * 경로 정규화:
 * - Express의 req.route?.path 가 있으면 그걸 최우선 사용 (예: "/users/:id")
 * - 없으면 originalUrl 에서 querystring 제거 후 숫자/UUID 등을 자리표시자로 치환
 */
function normalizePath(req: Request): string {
  // 1) 라우트가 잡힌 경우(가장 정확)
  const routePath = (req.route as { path?: string } | undefined)?.path;
  if (typeof routePath === 'string' && routePath.length > 0) return routePath;

  // 2) fallback: originalUrl (query 제거)
  const raw = typeof req.originalUrl === 'string' ? req.originalUrl.split('?')[0] : req.url;

  // 3) 간단한 정규화 규칙들 (원하는 규칙 추가 가능)
  //    - 숫자만 있는 세그먼트 -> :id
  //    - UUID v4/ulid/hextoken 류 -> :id
  const uuidLike = /^(?:[0-9a-fA-F-]{8,}|[0-9A-Za-z_-]{10,})$/; // 넉넉히 커버
  const segments = raw.split('/').map((seg) => {
    if (seg === '') return seg;
    if (/^\d+$/.test(seg)) return ':id';
    if (uuidLike.test(seg)) return ':id';
    return seg;
  });
  const normalized = segments.join('/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

/**
 * Prometheus Registry 및 공용 메트릭
 */
const register = new client.Registry();

// 기본 프로세스 메트릭 수집 (CPU, 메모리, event loop lag 등)
client.collectDefaultMetrics({ register, eventLoopMonitoringPrecision: 100 });

// 제외할 경로(스크레이프/헬스체크 등)
const EXCLUDED_PATHS = new Set<string>(['/metrics', '/health']);

// 상태군 라벨 도우미
function toStatusClass(code: number): '2xx' | '3xx' | '4xx' | '5xx' {
  if (code >= 500) return '5xx';
  if (code >= 400) return '4xx';
  if (code >= 300) return '3xx';
  return '2xx';
}

// 요청 총량
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code', 'status_class'] as const,
  registers: [register],
});

// 진행 중 요청 수 (포화도 지표)
const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently in flight',
  labelNames: ['method', 'path'] as const,
  registers: [register],
});

// 요청 지연 시간 (초) - SLI/SLO를 위한 히스토그램
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status_code', 'status_class'] as const,
  // p50~p99까지 보기 좋은 버킷 (서비스 특성에 맞게 조정)
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 8, 10],
  registers: [register],
});

// 오류율 관측: 5xx 및 429(레이트리밋) 전용 카운터
const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP error responses (5xx) and rate limits (429)',
  labelNames: ['method', 'path', 'status_code'] as const,
  registers: [register],
});

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MetricsMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const normalizedPath = normalizePath(req);
    if (EXCLUDED_PATHS.has(normalizedPath)) return next();

    const start = process.hrtime.bigint();
    const method = req.method.toUpperCase();
    const path = normalizedPath;

    httpRequestsInFlight.labels({ method, path }).inc();

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const seconds = Number(end - start) / 1e9;
      const status_code = String(res.statusCode);
      const status_class = toStatusClass(res.statusCode);

      httpRequestsInFlight.labels({ method, path }).dec();
      httpRequestsTotal.labels({ method, path, status_code, status_class }).inc();
      httpRequestDurationSeconds.labels({ method, path, status_code, status_class }).observe(seconds);

      if (res.statusCode >= 500 || res.statusCode === 429) {
        httpErrorsTotal.labels({ method, path, status_code }).inc();
      }
    });

    next();
  }
}

export function getMetricsRegistry(): client.Registry {
  return register;
}
