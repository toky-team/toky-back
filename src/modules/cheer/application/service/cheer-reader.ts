import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { CheerRepository } from '~/modules/cheer/application/port/out/cheer-repository.port';
import { Cheer } from '~/modules/cheer/domain/model/cheer';

@Injectable()
export class CheerReader {
  constructor(private readonly cheerRepository: CheerRepository) {}

  async findBySport(sport: Sport): Promise<Cheer | null> {
    return this.cheerRepository.findBySport(sport);
  }

  async findAll(): Promise<Cheer[]> {
    return this.cheerRepository.findAll();
  }
}
