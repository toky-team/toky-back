import { Injectable } from '@nestjs/common';

import { University } from '~/libs/enums/university';
import { CheerRepository } from '~/modules/cheer/application/port/out/cheer-repository.port';
import { Cheer } from '~/modules/cheer/domain/model/cheer';

@Injectable()
export class CheerReader {
  constructor(private readonly cheerRepository: CheerRepository) {}

  async findByUserId(userId: string): Promise<Cheer | null> {
    return this.cheerRepository.findByUserId(userId);
  }

  async countWithUniversity(): Promise<{
    [University.KOREA_UNIVERSITY]: number;
    [University.YONSEI_UNIVERSITY]: number;
  }> {
    const cheers = await this.cheerRepository.findAll();
    return cheers.reduce(
      (acc, cheer) => {
        acc[cheer.university] = (acc[cheer.university] || 0) + 1;
        return acc;
      },
      {
        [University.KOREA_UNIVERSITY]: 0,
        [University.YONSEI_UNIVERSITY]: 0,
      }
    );
  }
}
