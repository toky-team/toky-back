import { MatchResult } from '~/libs/enums/match-result';

export class MatchResultRatioDto {
  [MatchResult.KOREA_UNIVERSITY]: number;
  [MatchResult.YONSEI_UNIVERSITY]: number;
  [MatchResult.DRAW]: number;
}
