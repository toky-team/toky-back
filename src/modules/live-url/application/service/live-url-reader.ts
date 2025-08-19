import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { LiveUrlRepository } from '~/modules/live-url/application/port/out/live-url-repository.port';
import { LiveUrl } from '~/modules/live-url/domain/model/live-url';

@Injectable()
export class LiveUrlReader {
  constructor(private readonly liveUrlRepository: LiveUrlRepository) {}

  async findById(id: string): Promise<LiveUrl | null> {
    return this.liveUrlRepository.findById(id);
  }

  async findAll(): Promise<LiveUrl[]> {
    return this.liveUrlRepository.findAll();
  }

  async findBySport(sport: Sport): Promise<LiveUrl[]> {
    return this.liveUrlRepository.findBySport(sport);
  }
}
