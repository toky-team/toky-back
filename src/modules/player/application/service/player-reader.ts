import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerFindFilter, PlayerRepository } from '~/modules/player/application/port/out/player-repository.port';
import { Player } from '~/modules/player/domain/model/player';

@Injectable()
export class PlayerReader {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async findById(id: string): Promise<Player | null> {
    return this.playerRepository.findById(id);
  }

  async findByNameAndUniversityAndSport(name: string, university: University, sport: Sport): Promise<Player | null> {
    return this.playerRepository.findByNameAndUniversityAndSport(name, university, sport);
  }

  async findMany(filter: PlayerFindFilter): Promise<Player[]> {
    return this.playerRepository.findMany(filter);
  }
}
