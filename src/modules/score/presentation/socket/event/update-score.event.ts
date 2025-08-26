import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';
import { DateUtil } from '~/libs/utils/date.util';
import { MatchStatus } from '~/modules/score/domain/model/match-status.vo';

export interface ScoreSocketPayload {
  sport: Sport;
  KUScore: number;
  YUScore: number;
  matchStatus: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export class ScoreUpdateEvent implements SocketEvent {
  event = 'score_update' as const;
  payload: ScoreUpdateEventPayload = {
    score: {
      sport: Sport.FOOTBALL,
      KUScore: 10,
      YUScore: 2,
      matchStatus: MatchStatus.IN_PROGRESS,
      createdAt: DateUtil.format(DateUtil.fromDate(new Date('2025-06-09T12:34:56Z'))),
      updatedAt: DateUtil.format(DateUtil.fromDate(new Date('2025-06-09T12:34:56Z'))),
    },
  };
}

export interface ScoreUpdateEventPayload {
  score: ScoreSocketPayload;
}
