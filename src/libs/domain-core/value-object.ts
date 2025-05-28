export abstract class ValueObject<T = unknown> {
  protected constructor(protected readonly props: T) {}

  toPrimitives(): T {
    return this.props;
  }

  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) return false;
    if (vo.constructor.name !== this.constructor.name) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  toJSON(): unknown {
    return this.toPrimitives();
  }

  toString(): string {
    return JSON.stringify(this.props);
  }
}
