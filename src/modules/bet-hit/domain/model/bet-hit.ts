import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { SportHit, SportHitProps } from '~/modules/bet-hit/domain/model/sport-hit';

export interface BetHitPrimitives {
  id: string;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
  userId: string;
  totalHitCount: number;
  sportHits: SportHitProps[];
}

type BetHitDomainEvent = never;

export class BetHit extends AggregateRoot<BetHitPrimitives, BetHitDomainEvent> {
  private _userId: string;
  private _totalHitCount: number;
  private _sportHits: Map<Sport, SportHit>;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    userId: string,
    totalHitCount: number,
    sportHits: Map<Sport, SportHit>
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._totalHitCount = totalHitCount;
    this._sportHits = sportHits;
  }

  public static create(id: string, userId: string): BetHit {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('BET_HIT', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('BET_HIT', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    // 모든 종목에 대해 초기 SportHit 객체 생성
    const sportHits = new Map<Sport, SportHit>();
    const allSports = Object.values(Sport);

    allSports.forEach((sport) => {
      sportHits.set(sport, SportHit.create(sport));
    });

    return new BetHit(id, now, now, null, userId, 0, sportHits);
  }

  public get userId(): string {
    return this._userId;
  }

  public get totalHitCount(): number {
    return this._totalHitCount;
  }

  public getSportHit(sport: Sport): SportHit {
    let sportHit = this._sportHits.get(sport);
    if (!sportHit) {
      sportHit = SportHit.create(sport);
      this._sportHits.set(sport, sportHit);
    }
    return sportHit;
  }

  public getAllSportHits(): SportHit[] {
    return Array.from(this._sportHits.values());
  }

  public updateMatchResultHit(sport: Sport, hit: boolean): void {
    const sportHit = this.getSportHit(sport);
    const previousHit = sportHit.matchResultHit;
    const newSportHit = sportHit.updateMatchResultHit(hit);

    this._sportHits.set(sport, newSportHit);
    this.updateTotalHitCount(previousHit, hit);
    this.touch();
  }

  public updateScoreHit(sport: Sport, hit: boolean): void {
    const sportHit = this.getSportHit(sport);
    const previousHit = sportHit.scoreHit;
    const newSportHit = sportHit.updateScoreHit(hit);

    this._sportHits.set(sport, newSportHit);
    this.updateTotalHitCount(previousHit, hit);
    this.touch();
  }

  public updatePlayerHit(sport: Sport, university: University, hit: boolean): void {
    switch (university) {
      case University.KOREA_UNIVERSITY:
        this.updateKuPlayerHit(sport, hit);
        break;
      case University.YONSEI_UNIVERSITY:
        this.updateYuPlayerHit(sport, hit);
        break;
      default:
        throw new DomainException('BET_HIT', '알 수 없는 대학입니다', HttpStatus.BAD_REQUEST);
    }
  }

  private updateKuPlayerHit(sport: Sport, hit: boolean): void {
    const sportHit = this.getSportHit(sport);
    const previousHit = sportHit.kuPlayerHit;
    const newSportHit = sportHit.updateKuPlayerHit(hit);

    this._sportHits.set(sport, newSportHit);
    this.updateTotalHitCount(previousHit, hit);
    this.touch();
  }

  private updateYuPlayerHit(sport: Sport, hit: boolean): void {
    const sportHit = this.getSportHit(sport);
    const previousHit = sportHit.yuPlayerHit;
    const newSportHit = sportHit.updateYuPlayerHit(hit);

    this._sportHits.set(sport, newSportHit);
    this.updateTotalHitCount(previousHit, hit);
    this.touch();
  }

  public updateAllSportHits(
    sport: Sport,
    matchResultHit: boolean,
    scoreHit: boolean,
    kuPlayerHit: boolean,
    yuPlayerHit: boolean
  ): void {
    const sportHit = this.getSportHit(sport);
    const previousHitCount = sportHit.getHitCount();

    const newSportHit = sportHit.updateAllHits(matchResultHit, scoreHit, kuPlayerHit, yuPlayerHit);
    this._sportHits.set(sport, newSportHit);

    const newHitCount = newSportHit.getHitCount();
    this._totalHitCount = this._totalHitCount - previousHitCount + newHitCount;

    this.touch();
  }

  private updateTotalHitCount(previousHit: boolean, newHit: boolean): void {
    if (!previousHit && newHit) {
      this._totalHitCount++;
    } else if (previousHit && !newHit) {
      this._totalHitCount--;
    }
  }

  private recalculateTotalHitCount(): void {
    this._totalHitCount = Array.from(this._sportHits.values()).reduce((total, sportHit) => {
      return total + sportHit.getHitCount();
    }, 0);
  }

  public getSportHitCount(sport: Sport): number {
    return this.getSportHit(sport).getHitCount();
  }

  public isAllHitForSport(sport: Sport): boolean {
    return this.getSportHit(sport).isAllHit();
  }

  public isAllHitForAllSports(): boolean {
    return Array.from(this._sportHits.values()).every((sportHit) => sportHit.isAllHit());
  }

  public getSportsWithHits(): Sport[] {
    return Array.from(this._sportHits.entries())
      .filter(([, sportHit]) => sportHit.hasAnyHit())
      .map(([sport]) => sport);
  }

  public delete(): void {
    if (this.isDeleted()) {
      throw new DomainException('BET_HIT', '이미 삭제된 베팅 적중 기록입니다', HttpStatus.BAD_REQUEST);
    }

    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public toPrimitives(): BetHitPrimitives {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      userId: this._userId,
      totalHitCount: this._totalHitCount,
      sportHits: Array.from(this._sportHits.values()).map((sportHit) => sportHit.toPrimitives()),
    };
  }

  public static reconstruct(primitives: BetHitPrimitives): BetHit {
    const sportHits = new Map<Sport, SportHit>();

    primitives.sportHits.forEach((sportHitPrimitive) => {
      const sportHit = SportHit.reconstruct(sportHitPrimitive);
      sportHits.set(sportHit.sport, sportHit);
    });

    const betHit = new BetHit(
      primitives.id,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt,
      primitives.userId,
      primitives.totalHitCount,
      sportHits
    );

    // 데이터 무결성 확인 및 수정
    betHit.recalculateTotalHitCount();

    return betHit;
  }
}
