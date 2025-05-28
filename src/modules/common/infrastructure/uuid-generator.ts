import { IdGenerator } from '~/libs/domain-core/id-generator.interface';

export class UuidGenerator extends IdGenerator {
  generateId(): string {
    return crypto.randomUUID();
  }
}
