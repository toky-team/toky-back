import { Injectable } from '@nestjs/common';

import { DrawRepository } from '~/modules/draw/application/port/out/draw-repository.port';
import { Draw } from '~/modules/draw/domain/model/draw';

@Injectable()
export class DrawReader {
  constructor(private readonly drawRepository: DrawRepository) {}

  async findById(id: string): Promise<Draw | null> {
    return this.drawRepository.findById(id);
  }

  async findAll(): Promise<Draw[]> {
    return this.drawRepository.findAll();
  }

  async findMany(giftId?: string, userId?: string): Promise<Draw[]> {
    return this.drawRepository.findMany({ giftId, userId });
  }
}
