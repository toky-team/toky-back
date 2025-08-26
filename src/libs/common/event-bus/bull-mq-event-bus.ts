import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import { RedisOptions } from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DomainEvent, EventConstructor } from '~/libs/core/domain-core/domain-event';

interface EventJobData {
  eventName: string;
  eventId: string;
  eventData: Record<string, unknown>;
}

@Injectable()
export class BullMQEventBus extends EventBus implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BullMQEventBus.name);
  private readonly queues: Map<string, Queue> = new Map();
  private readonly workers: Map<string, Worker> = new Map();
  private readonly queueEvents: Map<string, QueueEvents> = new Map();
  private readonly handlers: Map<EventConstructor<DomainEvent>, Set<(event: DomainEvent) => void | Promise<void>>> =
    new Map();

  private redisConnection: RedisOptions;

  constructor(private readonly redisConfig: RedisConfig) {
    super();
  }

  onModuleInit(): void {
    // Redis 연결 설정 직접 가져오기
    this.redisConnection = this.redisConfig.getRedisOptions();
    this.logger.log('BullMQ EventBus initialized');
  }

  async onModuleDestroy(): Promise<void> {
    // 모든 큐, 워커, 큐 이벤트 정리
    await Promise.all([
      ...Array.from(this.workers.values()).map((worker) => worker.close()),
      ...Array.from(this.queues.values()).map((queue) => queue.close()),
      ...Array.from(this.queueEvents.values()).map((queueEvents) => queueEvents.close()),
    ]);

    this.logger.log('BullMQ EventBus destroyed');
  }

  async emit<E extends DomainEvent>(event: E): Promise<void> {
    const queueName = `event-${event.eventName}`;
    let queue = this.queues.get(queueName);

    if (!queue) {
      queue = new Queue(queueName, {
        connection: this.redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      });
      this.queues.set(queueName, queue);
    }

    const jobData: EventJobData = {
      eventName: event.eventName,
      eventId: event.eventId,
      eventData: event.toJSON(),
    };

    // eventId를 jobId로 사용하여 중복 처리 방지
    await queue.add(event.eventName, jobData, {
      jobId: event.eventId, // 같은 eventId는 한 번만 처리됨
      delay: 0,
    });

    this.logger.debug(`Event emitted: ${event.eventName} with ID: ${event.eventId}`);
  }

  subscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void> {
    const queueName = `event-${eventClass.eventName}`;

    // 핸들러 등록
    if (!this.handlers.has(eventClass)) {
      this.handlers.set(eventClass, new Set());
      this.createWorkerForEvent(eventClass, queueName);
    }

    this.handlers.get(eventClass)!.add(handler);
    this.logger.debug(`Subscribed to event: ${eventClass.eventName}`);

    return Promise.resolve();
  }

  async unsubscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void> {
    const handlers = this.handlers.get(eventClass);
    if (handlers) {
      handlers.delete(handler);

      // 핸들러가 더 이상 없으면 워커 정리
      if (handlers.size === 0) {
        this.handlers.delete(eventClass);
        await this.removeWorkerForEvent(eventClass.eventName);
      }
    }

    this.logger.debug(`Unsubscribed from event: ${eventClass.eventName}`);
  }

  private createWorkerForEvent<E extends DomainEvent>(eventClass: EventConstructor<E>, queueName: string): void {
    if (this.workers.has(queueName)) {
      return; // 이미 워커가 존재함
    }

    const worker = new Worker(
      queueName,
      async (job: Job<EventJobData>) => {
        const { eventName, eventId, eventData } = job.data;

        try {
          // JSON 데이터로부터 이벤트 객체 생성
          const event = eventClass.fromJSON(eventData);

          // 등록된 모든 핸들러 실행
          const handlers = this.handlers.get(eventClass);
          if (handlers) {
            await Promise.all(
              Array.from(handlers).map(async (handler) => {
                try {
                  await handler(event);
                } catch (error) {
                  this.logger.error(`Error in handler for event ${eventName}:${eventId}`, error);
                  throw error; // 재시도를 위해 에러를 다시 던짐
                }
              })
            );
          }

          this.logger.debug(`Successfully processed event: ${eventName} with ID: ${eventId}`);
        } catch (error) {
          this.logger.error(`Failed to process event ${eventName}:${eventId}`, error);
          throw error;
        }
      },
      {
        connection: this.redisConnection,
        concurrency: 5, // 동시 처리 작업 수
      }
    );

    // 워커 에러 핸들링
    worker.on('error', (error) => {
      this.logger.error(`Worker error for queue ${queueName}:`, error);
    });

    worker.on('failed', (job, error) => {
      this.logger.error(`Job failed for event ${job?.data.eventName}:${job?.data.eventId}`, error);
    });

    this.workers.set(queueName, worker);

    // 큐 이벤트 모니터링 (옵션)
    const queueEvents = new QueueEvents(queueName, {
      connection: this.redisConnection,
    });

    queueEvents.on('completed', ({ jobId }) => {
      this.logger.debug(`Job completed: ${jobId}`);
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.warn(`Job failed: ${jobId}, reason: ${failedReason}`);
    });

    this.queueEvents.set(queueName, queueEvents);
  }

  private async removeWorkerForEvent(eventName: string): Promise<void> {
    const queueName = `event-${eventName}`;

    const worker = this.workers.get(queueName);
    if (worker) {
      await worker.close();
      this.workers.delete(queueName);
    }

    const queueEvents = this.queueEvents.get(queueName);
    if (queueEvents) {
      await queueEvents.close();
      this.queueEvents.delete(queueName);
    }

    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.close();
      this.queues.delete(queueName);
    }
  }
}
