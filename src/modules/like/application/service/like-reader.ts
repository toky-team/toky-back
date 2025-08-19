import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { LikeRepository } from '~/modules/like/application/port/out/like-repository.port';
import { Like } from '~/modules/like/domain/model/like';

@Injectable()
export class LikeReader {
  constructor(private readonly likeRepository: LikeRepository) {}

  async findBySport(sport: Sport): Promise<Like | null> {
    return this.likeRepository.findBySport(sport);
  }

  async findAll(): Promise<Like[]> {
    return this.likeRepository.findAll();
  }
}
