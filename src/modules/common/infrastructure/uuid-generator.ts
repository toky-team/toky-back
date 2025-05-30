import { IdGenerator } from '~/modules/common/application/port/in/id-generator.interface';

export class UuidGenerator extends IdGenerator {
  generateId(): string {
    return crypto.randomUUID();
  }
}
