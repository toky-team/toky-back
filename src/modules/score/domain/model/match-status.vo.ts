import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';

export enum MatchStatus {
  NOT_STARTED = '시작 전',
  IN_PROGRESS = '진행 중',
  COMPLETED = '종료',
}

interface MatchStatusProps {
  value: MatchStatus;
}

export class MatchStatusVO extends ValueObject<MatchStatusProps> {
  private constructor(props: MatchStatusProps) {
    super(props);
  }

  public static create(status: MatchStatus): MatchStatusVO {
    if (!Object.values(MatchStatus).includes(status)) {
      throw new DomainException('SCORE', `유효하지 않은 경기 상태입니다: ${status}`, HttpStatus.BAD_REQUEST);
    }
    return new MatchStatusVO({ value: status });
  }

  public get value(): MatchStatus {
    return this.props.value;
  }

  public matchStart(): void {
    if (this.value === MatchStatus.IN_PROGRESS) {
      throw new DomainException('SCORE', '경기가 이미 진행 중입니다.', HttpStatus.BAD_REQUEST);
    }
    if (this.value === MatchStatus.COMPLETED) {
      throw new DomainException('SCORE', '경기가 이미 종료되었습니다.', HttpStatus.BAD_REQUEST);
    }
    this.props.value = MatchStatus.IN_PROGRESS;
  }

  public matchComplete(): void {
    if (this.value === MatchStatus.NOT_STARTED) {
      throw new DomainException('SCORE', '경기가 시작되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }
    if (this.value === MatchStatus.COMPLETED) {
      throw new DomainException('SCORE', '경기가 이미 종료되었습니다.', HttpStatus.BAD_REQUEST);
    }
    this.props.value = MatchStatus.COMPLETED;
  }

  public matchReset(): void {
    if (this.value === MatchStatus.NOT_STARTED) {
      throw new DomainException('SCORE', '경기가 시작되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }
    if (this.value === MatchStatus.IN_PROGRESS) {
      throw new DomainException(
        'SCORE',
        '경기가 진행 중입니다. 종료 후 다시 시작할 수 있습니다.',
        HttpStatus.BAD_REQUEST
      );
    }
    this.props.value = MatchStatus.NOT_STARTED;
  }

  public isInProgress(): boolean {
    return this.value === MatchStatus.IN_PROGRESS;
  }

  override toString(): string {
    return this.value;
  }
}
