import { Injectable } from '@nestjs/common';

import { PlayerRepository } from '~/modules/player/application/port/out/player-repository.port';
import { Player } from '~/modules/player/domain/model/player';

@Injectable()
export class PlayerPersister {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async save(player: Player): Promise<void> {
    await this.playerRepository.save(player);
  }

  async saveAll(players: Player[]): Promise<void> {
    await this.playerRepository.saveAll(players);
  }
}
