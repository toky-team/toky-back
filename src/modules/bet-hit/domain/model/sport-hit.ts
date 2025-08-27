import { ValueObject } from '~/libs/core/domain-core/value-object';
import { Sport } from '~/libs/enums/sport';

export interface SportHitProps {
  sport: Sport;
  matchResultHit: boolean;
  scoreHit: boolean;
  kuPlayerHit: boolean;
  yuPlayerHit: boolean;
}

export class SportHit extends ValueObject<SportHitProps> {
  private constructor(props: SportHitProps) {
    super(props);
  }

  public static create(sport: Sport): SportHit {
    return new SportHit({
      sport,
      matchResultHit: false,
      scoreHit: false,
      kuPlayerHit: false,
      yuPlayerHit: false,
    });
  }

  public static createWithHits(
    sport: Sport,
    matchResultHit: boolean,
    scoreHit: boolean,
    kuPlayerHit: boolean,
    yuPlayerHit: boolean
  ): SportHit {
    return new SportHit({
      sport,
      matchResultHit,
      scoreHit,
      kuPlayerHit,
      yuPlayerHit,
    });
  }

  public get sport(): Sport {
    return this.props.sport;
  }

  public get matchResultHit(): boolean {
    return this.props.matchResultHit;
  }

  public get scoreHit(): boolean {
    return this.props.scoreHit;
  }

  public get kuPlayerHit(): boolean {
    return this.props.kuPlayerHit;
  }

  public get yuPlayerHit(): boolean {
    return this.props.yuPlayerHit;
  }

  public updateMatchResultHit(hit: boolean): SportHit {
    return new SportHit({
      ...this.props,
      matchResultHit: hit,
    });
  }

  public updateScoreHit(hit: boolean): SportHit {
    return new SportHit({
      ...this.props,
      scoreHit: hit,
    });
  }

  public updateKuPlayerHit(hit: boolean): SportHit {
    return new SportHit({
      ...this.props,
      kuPlayerHit: hit,
    });
  }

  public updateYuPlayerHit(hit: boolean): SportHit {
    return new SportHit({
      ...this.props,
      yuPlayerHit: hit,
    });
  }

  public updateAllHits(
    matchResultHit: boolean,
    scoreHit: boolean,
    kuPlayerHit: boolean,
    yuPlayerHit: boolean
  ): SportHit {
    return new SportHit({
      ...this.props,
      matchResultHit,
      scoreHit,
      kuPlayerHit,
      yuPlayerHit,
    });
  }

  public getHitCount(): number {
    let count = 0;
    if (this.props.matchResultHit) count++;
    if (this.props.scoreHit) count++;
    if (this.props.kuPlayerHit) count++;
    if (this.props.yuPlayerHit) count++;
    return count;
  }

  public isAllHit(): boolean {
    return this.props.matchResultHit && this.props.scoreHit && this.props.kuPlayerHit && this.props.yuPlayerHit;
  }

  public hasAnyHit(): boolean {
    return this.props.matchResultHit || this.props.scoreHit || this.props.kuPlayerHit || this.props.yuPlayerHit;
  }

  public static reconstruct(props: SportHitProps): SportHit {
    return new SportHit(props);
  }
}
