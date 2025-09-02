import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';

export enum AttendanceGameStatus {
  NOT_STARTED = '시작 전',
  IN_PROGRESS = '진행 중',
  COMPLETED = '종료',
}

interface AttendanceGameStatusProps {
  value: AttendanceGameStatus;
}

export class AttendanceGameStatusVO extends ValueObject<AttendanceGameStatusProps> {
  private constructor(props: AttendanceGameStatusProps) {
    super(props);
  }

  public static create(status: AttendanceGameStatus): AttendanceGameStatusVO {
    if (!Object.values(AttendanceGameStatus).includes(status)) {
      throw new DomainException('ATTENDANCE', '잘못된 게임 상태입니다', HttpStatus.BAD_REQUEST);
    }
    return new AttendanceGameStatusVO({ value: status });
  }

  public get value(): AttendanceGameStatus {
    return this.props.value;
  }

  public startGame(): void {
    if (this.value === AttendanceGameStatus.IN_PROGRESS) {
      throw new DomainException('ATTENDANCE', '게임이 이미 진행 중입니다.', HttpStatus.BAD_REQUEST);
    }
    if (this.value === AttendanceGameStatus.COMPLETED) {
      throw new DomainException('ATTENDANCE', '게임이 이미 종료되었습니다.', HttpStatus.BAD_REQUEST);
    }
    this.props.value = AttendanceGameStatus.IN_PROGRESS;
  }

  public completeGame(): void {
    if (this.value === AttendanceGameStatus.NOT_STARTED) {
      throw new DomainException('ATTENDANCE', '게임이 시작되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }
    if (this.value === AttendanceGameStatus.COMPLETED) {
      throw new DomainException('ATTENDANCE', '게임이 이미 종료되었습니다.', HttpStatus.BAD_REQUEST);
    }
    this.props.value = AttendanceGameStatus.COMPLETED;
  }

  public startGameAgain(): void {
    if (this.value !== AttendanceGameStatus.COMPLETED) {
      throw new DomainException('ATTENDANCE', '게임이 종료되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }
    this.props.value = AttendanceGameStatus.IN_PROGRESS;
  }

  public isNotStarted(): boolean {
    return this.value === AttendanceGameStatus.NOT_STARTED;
  }

  public isInProgress(): boolean {
    return this.value === AttendanceGameStatus.IN_PROGRESS;
  }

  public isCompleted(): boolean {
    return this.value === AttendanceGameStatus.COMPLETED;
  }

  override toString(): string {
    return this.value;
  }
}
