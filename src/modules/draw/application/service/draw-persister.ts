import { Injectable } from '@nestjs/common';

import { DrawRepository } from '~/modules/draw/application/port/out/draw-repository.port';
import { Draw } from '~/modules/draw/domain/model/draw';

@Injectable()
export class DrawPersister {
  constructor(private readonly drawRepository: DrawRepository) {}

  async save(draw: Draw): Promise<void> {
    await this.drawRepository.save(draw);
  }

  async saveAll(draws: Draw[]): Promise<void> {
    await this.drawRepository.saveAll(draws);
  }
}
