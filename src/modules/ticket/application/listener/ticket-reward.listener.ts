import { Injectable, OnModuleInit } from '@nestjs/common';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { UniversityAliasMap } from '~/libs/enums/university';
import { FirstStageWinEvent } from '~/modules/attendance/domain/event/first-stage-win.event';
import { SecondStageWinEvent } from '~/modules/attendance/domain/event/second-stage-win.event';
import { MatchResultCorrectEvent } from '~/modules/bet-answer/domain/event/match-result-correct.event';
import { MatchResultPredictedEvent } from '~/modules/bet-answer/domain/event/match-result-predicted.event';
import { PlayerCorrectEvent } from '~/modules/bet-answer/domain/event/player-correct.event';
import { PlayerPredictedEvent } from '~/modules/bet-answer/domain/event/player-predicted.event';
import { PredictAllCorrectEvent } from '~/modules/bet-answer/domain/event/predict-all-correct.event';
import { ScoreCorrectEvent } from '~/modules/bet-answer/domain/event/score-correct.event';
import { ScorePredictedEvent } from '~/modules/bet-answer/domain/event/score-predicted.event';
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
    // 회원 가입 시 3장
    await this.eventBus.subscribe(UserCreatedEvent, async (event: UserCreatedEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 3, '회원가입을 축하합니다!');
    });
    // 친구 초대된 사용자 가입 시 양쪽 다 5장
    await this.eventBus.subscribe(UserInvitedEvent, async (event: UserInvitedEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 5, '친구 링크로 가입한 당신에게 주는 선물!');
      await this.ticketFacade.incrementTicketCount(event.invitedBy, 5, '내 친구가 새롭게 가입했어요!');
    });
    // 경기결과 예측 시 1장
    await this.eventBus.subscribe(MatchResultPredictedEvent, async (event: MatchResultPredictedEvent) => {
      await this.ticketFacade.incrementTicketCount(
        event.userId,
        1,
        `${event.sport} 승부예측 참여 응모권이 지급되었어요`
      );
    });
    // 점수 예측 시 1장
    await this.eventBus.subscribe(ScorePredictedEvent, async (event: ScorePredictedEvent) => {
      await this.ticketFacade.incrementTicketCount(
        event.userId,
        1,
        `${event.sport} 점수예측 참여 응모권이 지급되었어요`
      );
    });
    // 선수 예측 시 1장
    await this.eventBus.subscribe(PlayerPredictedEvent, async (event: PlayerPredictedEvent) => {
      await this.ticketFacade.incrementTicketCount(
        event.userId,
        1,
        `${UniversityAliasMap[event.university]} ${event.sport} 선수예측 참여 응모권이 지급되었어요`
      );
    });
    // 예측 공유 시 1장
    await this.eventBus.subscribe(BetShareCompletedEvent, async (event: BetShareCompletedEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 1, '승부예측 공유 참여 응모권이 지급되었어요');
    });
    // 출석게임 1단계 승리 시 1장
    await this.eventBus.subscribe(FirstStageWinEvent, async (event: FirstStageWinEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 1, '출석게임 성공 응모권이 지급되었어요');
    });
    // 출석게임 2단계 승리 시 1장
    await this.eventBus.subscribe(SecondStageWinEvent, async (event: SecondStageWinEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 1, '출석게임 성공 응모권이 지급되었어요');
    });
    // 경기결과 예측 성공 시 3장
    await this.eventBus.subscribe(MatchResultCorrectEvent, async (event: MatchResultCorrectEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 3, `${event.sport} 결과 승부예측에 성공했어요!`);
    });
    // 경기점수 예측 성공 시 3장
    await this.eventBus.subscribe(ScoreCorrectEvent, async (event: ScoreCorrectEvent) => {
      await this.ticketFacade.incrementTicketCount(event.userId, 3, `${event.sport} 스코어 예측에 성공했어요!`);
    });
    // 선수예측 성공 시 3장
    await this.eventBus.subscribe(PlayerCorrectEvent, async (event: PlayerCorrectEvent) => {
      await this.ticketFacade.incrementTicketCount(
        event.userId,
        3,
        `${UniversityAliasMap[event.university]} ${event.sport} 선수예측에 성공했어요!`
      );
    });
    // 예측 모두 성공 시 맞춘 개수*3장
    await this.eventBus.subscribe(PredictAllCorrectEvent, async (event: PredictAllCorrectEvent) => {
      await this.ticketFacade.incrementTicketCount(
        event.userId,
        event.hitCount * 3,
        `${event.sport} 종목 승부예측을 모두 성공한 기념으로 보너스 응모권을 드려요!`
      );
    });
  }
}
