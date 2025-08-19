import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { CheerRepository } from '~/modules/cheer/application/port/out/cheer-repository.port';
import { Cheer } from '~/modules/cheer/domain/model/cheer';

@Injectable()
export class CheerInitializeService implements OnApplicationBootstrap {
  constructor(private readonly cheerRepository: CheerRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.initializeCheers();
  }

  async initializeCheers(): Promise<void> {
    const sports = Object.values(Sport);
    for (const sport of sports) {
      const cheer = await this.cheerRepository.findBySport(sport);
      if (cheer === null) {
        const newCheer = Cheer.create(sport);
        await this.cheerRepository.save(newCheer);
      }
    }
  }
}
