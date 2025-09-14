import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import { RedisOptions } from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { DistributedLock } from '~/libs/common/distributed-lock/distributed-lock.interface';
import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DomainEvent, EventConstructor } from '~/libs/core/domain-core/domain-event';

interface EventJobData {
  eventName: string;
  eventId: string;
  eventData: Record<string, unknown>;
  userId?: string; // 사용자 ID 추가
}

@Injectable()
export class BullMQEventBus extends EventBus implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BullMQEventBus.name);
  private readonly queues: Map<string, Queue> = new Map();
  private readonly workers: Map<string, Worker> = new Map();
  private readonly queueEvents: Map<string, QueueEvents> = new Map();
  private readonly handlers: Map<EventConstructor<DomainEvent>, Set<(event: DomainEvent) => void | Promise<void>>> =
    new Map();

  // 사용자별 워커 관리를 위한 Map
  private readonly userWorkers: Map<string, Worker> = new Map();
  private readonly userQueues: Map<string, Queue> = new Map();

  private redisConnection: RedisOptions;

  constructor(
    private readonly redisConfig: RedisConfig,
    private readonly distributedLock: DistributedLock
  ) {
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
      ...Array.from(this.userWorkers.values()).map((worker) => worker.close()),
      ...Array.from(this.queues.values()).map((queue) => queue.close()),
      ...Array.from(this.userQueues.values()).map((queue) => queue.close()),
      ...Array.from(this.queueEvents.values()).map((queueEvents) => queueEvents.close()),
    ]);

    this.logger.log('BullMQ EventBus destroyed');
  }

  async emit<E extends DomainEvent>(event: E): Promise<void> {
    // userId가 있는 경우 사용자별 전용 큐 사용, 없으면 일반 큐 사용
    const isUserEvent = !!event.userId;

    let queue: Queue;

    if (isUserEvent) {
      // 사용자별 전용 큐 가져오기 또는 생성
      queue = await this.getOrCreateUserQueue(event.userId);
    } else {
      // 일반 이벤트 큐 가져오기 또는 생성
      queue = await this.getOrCreateGeneralQueue(event.eventName);
    }

    const jobData: EventJobData = {
      eventName: event.eventName,
      eventId: event.eventId,
      eventData: event.toJSON(),
      userId: event.userId,
    };

    // eventId를 jobId로 사용하여 중복 처리 방지
    await queue.add(event.eventName, jobData, {
      jobId: event.eventId,
      delay: 0,
    });

    this.logger.debug(
      `Event emitted: ${event.eventName} with ID: ${event.eventId} ${isUserEvent ? `for user: ${event.userId}` : '(global)'}`
    );
  }

  subscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void> {
    const queueName = `event-${eventClass.eventName}`;

    // 핸들러 등록
    if (!this.handlers.has(eventClass)) {
      this.handlers.set(eventClass, new Set());
      // 일반 이벤트에 대한 워커 생성 (병렬 처리 허용)
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
        concurrency: 5, // 일반 이벤트는 병렬 처리 허용
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

  /**
   * 사용자별 전용 큐를 가져오거나 생성합니다.
   * 분산 환경에서 안전한 생성을 위해 분산 락을 사용합니다.
   */
  private async getOrCreateUserQueue(userId: string): Promise<Queue> {
    const queueName = `user-events-${userId}`;

    // 이미 존재하는 큐가 있으면 반환 (로컬 캐시 체크)
    const queue = this.userQueues.get(queueName);
    if (queue) {
      return queue;
    }

    // 분산 락을 사용하여 분산 환경에서 안전한 큐 생성
    return await this.distributedLock.withLock(
      `user-queue-creation-${userId}`,
      () => {
        // 락 획득 후 다시 한번 체크 (다른 서버에서 생성했을 수 있음)
        const existingQueue = this.userQueues.get(queueName);
        if (existingQueue) {
          return Promise.resolve(existingQueue);
        }

        // 새 큐 생성
        const newQueue = new Queue(queueName, {
          connection: this.redisConnection,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: 50,
            removeOnFail: 20,
          },
        });

        this.userQueues.set(queueName, newQueue);

        // 사용자별 워커 생성
        this.createUserWorker(userId, queueName);

        return Promise.resolve(newQueue);
      },
      10000 // 10초 락 유지
    );
  }

  /**
   * 일반 이벤트 큐를 가져오거나 생성합니다.
   * 분산 환경에서 안전한 생성을 위해 분산 락을 사용합니다.
   */
  private async getOrCreateGeneralQueue(eventName: string): Promise<Queue> {
    const queueName = `event-${eventName}`;

    // 이미 존재하는 큐가 있으면 반환 (로컬 캐시 체크)
    const queue = this.queues.get(queueName);
    if (queue) {
      return queue;
    }

    // 분산 락을 사용하여 분산 환경에서 안전한 큐 생성
    return await this.distributedLock.withLock(
      `general-queue-creation-${eventName}`,
      () => {
        // 락 획득 후 다시 한번 체크
        const existingQueue = this.queues.get(queueName);
        if (existingQueue) {
          return Promise.resolve(existingQueue);
        }

        // 새 큐 생성
        const newQueue = new Queue(queueName, {
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

        this.queues.set(queueName, newQueue);
        return Promise.resolve(newQueue);
      },
      10000 // 10초 락 유지
    );
  }

  /**
   * 사용자별 워커를 생성합니다.
   * concurrency 1로 설정하여 해당 사용자의 이벤트가 순차적으로 처리되도록 보장합니다.
   */
  private createUserWorker(userId: string, queueName: string): void {
    // 이미 워커가 존재하는지 체크 (동시성 문제 방지)
    if (this.userWorkers.has(queueName)) {
      return; // 이미 워커가 존재함
    }

    const worker = new Worker(
      queueName,
      async (job: Job<EventJobData>) => {
        const { eventName, eventId, eventData } = job.data;

        try {
          // 이벤트 이름으로 등록된 핸들러들을 찾기
          const eventClass = this.findEventClassByName(eventName);
          if (!eventClass) {
            this.logger.warn(`No event class found for event: ${eventName}`);
            return;
          }

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
                  this.logger.error(`Error in handler for event ${eventName}:${eventId} (user: ${userId})`, error);
                  throw error; // 재시도를 위해 에러를 다시 던짐
                }
              })
            );
          }

          this.logger.debug(`Successfully processed user event: ${eventName} with ID: ${eventId} for user: ${userId}`);
        } catch (error) {
          this.logger.error(`Failed to process user event ${eventName}:${eventId} for user: ${userId}`, error);
          throw error;
        }
      },
      {
        connection: this.redisConnection,
        concurrency: 1, // 사용자별 순차 처리
      }
    );

    // 워커 중복 생성 방지를 위한 최종 체크
    if (this.userWorkers.has(queueName)) {
      // 다른 스레드에서 이미 생성했다면 새로 만든 워커는 닫기
      worker.close().catch(() => {});
      return;
    }

    // 워커 에러 핸들링
    worker.on('error', (error) => {
      this.logger.error(`User worker error for queue ${queueName}:`, error);
    });

    worker.on('failed', (job, error) => {
      this.logger.error(
        `User job failed for event ${job?.data.eventName}:${job?.data.eventId} (user: ${userId})`,
        error
      );
    });

    this.userWorkers.set(queueName, worker);
  }

  /**
   * 이벤트 이름으로 이벤트 클래스를 찾습니다.
   */
  private findEventClassByName(eventName: string): EventConstructor<DomainEvent> | null {
    for (const [eventClass] of this.handlers) {
      if (eventClass.eventName === eventName) {
        return eventClass;
      }
    }
    return null;
  }
}
