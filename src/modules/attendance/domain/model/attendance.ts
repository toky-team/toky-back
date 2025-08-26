import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';
import { FirstStageWinEvent } from '~/modules/attendance/domain/event/first-stage-win.event';
import { SecondStageWinEvent } from '~/modules/attendance/domain/event/second-stage-win.event';
import { AttendanceGameStatus, AttendanceGameStatusVO } from '~/modules/attendance/domain/model/game-status.vo';

export interface AttendancePrimitives {
  id: string;
  userId: string;
  attendandAt: Dayjs;
  gameStatus: AttendanceGameStatus;
  firstStageResult: boolean | null;
  secondStageResult: boolean | null;
  isAttended: boolean;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
}

type AttendanceDomainEvent = FirstStageWinEvent | SecondStageWinEvent;

export class Attendance extends AggregateRoot<AttendancePrimitives, AttendanceDomainEvent> {
  private _userId: string;
  private _attendandAt: Dayjs;
  private _gameStatus: AttendanceGameStatusVO;
  private _firstStageResult: boolean | null;
  private _secondStageResult: boolean | null;

  private constructor(
    id: string,
    userId: string,
    attendandAt: Dayjs,
    gameStatus: AttendanceGameStatusVO,
    firstStageResult: boolean | null,
    secondStageResult: boolean | null,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._attendandAt = attendandAt;
    this._gameStatus = gameStatus;
    this._firstStageResult = firstStageResult;
    this._secondStageResult = secondStageResult;
  }

  public static create(id: string, userId: string): Attendance {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('ATTENDANCE', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('ATTENDANCE', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const gameStatus = AttendanceGameStatusVO.create(AttendanceGameStatus.NOT_STARTED);

    return new Attendance(id, userId, now, gameStatus, null, null, now, now, null);
  }

  public get userId(): string {
    return this._userId;
  }

  public get attendandAt(): Dayjs {
    return this._attendandAt;
  }

  public get gameStatus(): AttendanceGameStatusVO {
    return this._gameStatus;
  }

  public get firstStageResult(): boolean | null {
    return this._firstStageResult;
  }

  public get secondStageResult(): boolean | null {
    return this._secondStageResult;
  }

  public startGame(): void {
    this._gameStatus.startGame();
    this.touch();
  }

  public completeFirstGame(win: boolean): void {
    if (!this.gameStatus.isInProgress()) {
      throw new DomainException('ATTENDANCE', '게임이 진행 중이 아닙니다.', HttpStatus.BAD_REQUEST);
    }
    if (this.firstStageResult !== null) {
      throw new DomainException('ATTENDANCE', '이미 1단계 게임을 완료하였습니다.', HttpStatus.BAD_REQUEST);
    }

    this._firstStageResult = win;
    if (win === true) {
      this.addEvent(new FirstStageWinEvent(this.id, this.userId));
    } else {
      this._gameStatus.completeGame();
    }
    this.touch();
  }

  public completeSecondGame(win: boolean): void {
    if (!this.gameStatus.isInProgress()) {
      throw new DomainException('ATTENDANCE', '게임이 진행 중이 아닙니다.', HttpStatus.BAD_REQUEST);
    }
    if (this.firstStageResult === null) {
      throw new DomainException('ATTENDANCE', '1단계 결과가 없습니다.', HttpStatus.BAD_REQUEST);
    }
    if (this.secondStageResult !== null) {
      throw new DomainException('ATTENDANCE', '이미 2단계 게임을 완료하였습니다.', HttpStatus.BAD_REQUEST);
    }

    this._secondStageResult = win;
    if (win === true) {
      this.addEvent(new SecondStageWinEvent(this.id, this.userId));
    }
    this._gameStatus.completeGame();
    this.touch();
  }

  public getAnotherChance(): void {
    if (!this.gameStatus.isCompleted()) {
      throw new DomainException('ATTENDANCE', '게임이 완료되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }
    if (!(this.firstStageResult === false && this.secondStageResult === null)) {
      throw new DomainException('ATTENDANCE', '재도전할 수 없습니다.', HttpStatus.BAD_REQUEST);
    }

    this._firstStageResult = null;
    this._gameStatus.startGameAgain();
    this.touch();
  }

  public getTicketCountByAttendance(): number {
    let ticketCount = 0;
    if (this.firstStageResult === true) {
      ticketCount += 1;
    }
    if (this.secondStageResult === true) {
      ticketCount += 1;
    }
    return ticketCount;
  }

  public toPrimitives(): AttendancePrimitives {
    return {
      id: this.id,
      userId: this.userId,
      attendandAt: this.attendandAt,
      gameStatus: this.gameStatus.value,
      firstStageResult: this.firstStageResult,
      secondStageResult: this.secondStageResult,
      isAttended: this.firstStageResult === true,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static reconstruct(primitives: AttendancePrimitives): Attendance {
    const gameStatus = AttendanceGameStatusVO.create(primitives.gameStatus);

    return new Attendance(
      primitives.id,
      primitives.userId,
      primitives.attendandAt,
      gameStatus,
      primitives.firstStageResult,
      primitives.secondStageResult,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt
    );
  }
}
