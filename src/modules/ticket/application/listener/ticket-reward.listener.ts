import { Injectable, OnModuleInit } from '@nestjs/common';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { FirstStageWinEvent } from '~/modules/attendance/domain/event/first-stage-win.event';
import { SecondStageWinEvent } from '~/modules/attendance/domain/event/second-stage-win.event';
import { MatchResultPredictedEvent } from '~/modules/bet-answer/domain/event/match-result-predicted.event';
import { PlayerPredictedEvent } from '~/modules/bet-answer/domain/event/player-predicted.event';
import { BetShareCompletedEvent } from '~/modules/share/domain/event/bet-share-completed.event';
import { TicketFacade } from '~/modules/ticket/application/port/in/ticket-facade.port';
import { UserCreatedEvent } from '~/modules/user/domain/events/user-created.event';
import { UserInvitedEvent } from '~/modules/user/domain/events/user-invited.event';

@Injectable()
export class TicketRewardlistener implements OnModuleInit {
  constructor(
    private readonly ticketFacade: TicketFacade,

    private readonly eventBus: EventBus
  ) {}

  async onModuleInit(): Promise<void> {
    // 회원 가입 시 100장
    await this.eventBus.subscribe(UserCreatedEvent, async (event: UserCreatedEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 100, '회원 가입을 축하합니다');
    });
    // 친구 초대된 사용자 가입 시 양쪽 다 50장
    await this.eventBus.subscribe(UserInvitedEvent, async (event: UserInvitedEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 50, '친구 초대 보상');
      await this.ticketFacade.incrementTicketCount(event.invitedBy, 50, '친구 초대 보상');
    });
    // 경기결과 예측 시 20장
    await this.eventBus.subscribe(MatchResultPredictedEvent, async (event: MatchResultPredictedEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 20, '경기 결과 예측 보상');
    });
    // 선수 예측 시 15장
    await this.eventBus.subscribe(PlayerPredictedEvent, async (event: PlayerPredictedEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 15, '선수 예측 보상');
    });
    // 예측 공유 시 20장
    await this.eventBus.subscribe(BetShareCompletedEvent, async (event: BetShareCompletedEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 20, '예측 공유 보상');
    });
    // 출석게임 1단계 승리 시 1장
    await this.eventBus.subscribe(FirstStageWinEvent, async (event: FirstStageWinEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 1, '출석게임 1단계 승리 보상');
    });
    // 출석게임 2단계 승리 시 1장
    await this.eventBus.subscribe(SecondStageWinEvent, async (event: SecondStageWinEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 1, '출석게임 2단계 승리 보상');
    });
  }
}
