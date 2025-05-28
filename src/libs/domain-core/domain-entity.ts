export abstract class DomainEntity<TPrimitives> {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null
  ) {}

  abstract toPrimitives(): TPrimitives;

  equals(entity?: DomainEntity<unknown>): boolean {
    if (!entity) return false;
    if (this === entity) return true;
    return this.constructor.name === entity.constructor.name && this.id === entity.id;
  }

  touch(): void {
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  toJSON(): unknown {
    return this.toPrimitives();
  }
}
