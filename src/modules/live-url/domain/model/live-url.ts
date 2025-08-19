import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export interface LiveUrlPrimitives {
  id: string;
  sport: Sport;
  broadcastName: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type LiveUrlDomainEvent = never;

export class LiveUrl extends AggregateRoot<LiveUrlPrimitives, LiveUrlDomainEvent> {
  private _sport: Sport;
  private _broadcastName: string;
  private _url: string;

  private constructor(
    id: string,
    sport: Sport,
    broadcastName: string,
    url: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._sport = sport;
    this._broadcastName = broadcastName;
    this._url = url;
  }

  public static create(id: string, sport: Sport, broadcastName: string, url: string): LiveUrl {
    const now = DateUtil.now();

    if (Object.values(Sport).includes(sport) === false) {
      throw new DomainException('LIVE_URL', '유효하지 않은 스포츠 종목입니다.', HttpStatus.BAD_REQUEST);
    }
    if (!broadcastName) {
      throw new DomainException('LIVE_URL', '방송사 명은 필수입니다.', HttpStatus.BAD_REQUEST);
    }
    if (!url) {
      throw new DomainException('LIVE_URL', 'URL은 필수입니다.', HttpStatus.BAD_REQUEST);
    }
    this.validateUrl(url);

    return new LiveUrl(id, sport, broadcastName, url, now, now, null);
  }

  private static validateUrl(url: string): void {
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!urlPattern.test(url)) {
      throw new DomainException('LIVE_URL', '유효한 URL 형식이 아닙니다.', HttpStatus.BAD_REQUEST);
    }
  }

  public get sport(): Sport {
    return this._sport;
  }

  public get broadcastName(): string {
    return this._broadcastName;
  }

  public get url(): string {
    return this._url;
  }

  public changeBroadcastName(newBroadcastName: string): void {
    if (!newBroadcastName) {
      throw new DomainException('LIVE_URL', '방송사 명은 필수입니다.', HttpStatus.BAD_REQUEST);
    }
    this._broadcastName = newBroadcastName;
    this.touch();
  }

  public changeUrl(newUrl: string): void {
    LiveUrl.validateUrl(newUrl);
    this._url = newUrl;
    this.touch();
  }

  public delete(): void {
    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public restore(): void {
    this.deletedAt = null;
    this.touch();
  }

  public toPrimitives(): LiveUrlPrimitives {
    return {
      id: this.id,
      sport: this.sport,
      broadcastName: this.broadcastName,
      url: this.url,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: LiveUrlPrimitives): LiveUrl {
    return new LiveUrl(
      primitives.id,
      primitives.sport,
      primitives.broadcastName,
      primitives.url,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
  }
}
