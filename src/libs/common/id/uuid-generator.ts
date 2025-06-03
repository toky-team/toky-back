import { IdGenerator } from '~/libs/common/id/id-generator.interface';

export class UuidGenerator extends IdGenerator {
  generateId(): string {
    return crypto.randomUUID();
  }
}
