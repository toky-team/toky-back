import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { StorageClient } from '~/libs/common/storage/storage.client';
import { toFile, validateImageFile } from '~/libs/common/storage/storage.util';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerFacade } from '~/modules/player/application/port/in/player-facade.port';
import { PlayerPersister } from '~/modules/player/application/service/player-persister';
import { PlayerReader } from '~/modules/player/application/service/player-reader';
import { Player, PlayerPrimitives } from '~/modules/player/domain/model/player';

@Injectable()
export class PlayerFacadeImpl extends PlayerFacade {
  private readonly PROFILE_IMAGE_PATH = 'player/profile';

  constructor(
    private readonly playerReader: PlayerReader,
    private readonly playerPersister: PlayerPersister,

    private readonly idGenerator: IdGenerator,
    private readonly storageClient: StorageClient
  ) {
    super();
  }

  @Transactional()
  async createPlayer(
    name: string,
    university: University,
    sport: Sport,
    department: string,
    birth: string,
    height: number,
    weight: number,
    position: string,
    backNumber: number,
    careers: string[],
    image: Express.Multer.File
  ): Promise<PlayerPrimitives> {
    const imageFile = toFile(image);

    const imageValidation = validateImageFile(imageFile, {
      maxSizeMB: 5,
      strictValidation: true,
    });
    if (!imageValidation.isValid) {
      throw new DomainException('PLAYER', '이미지 파일이 유효하지 않습니다.', HttpStatus.BAD_REQUEST);
    }

    const { url, key } = await this.storageClient.uploadFile(imageFile, this.PROFILE_IMAGE_PATH);

    const player = Player.create(
      this.idGenerator.generateId(),
      name,
      university,
      sport,
      department,
      birth,
      height,
      weight,
      position,
      backNumber,
      careers,
      url,
      key
    );
    await this.playerPersister.save(player);
    return player.toPrimitives();
  }

  @Transactional()
  async updatePlayer(
    id: string,
    name?: string,
    university?: University,
    sport?: Sport,
    department?: string,
    birth?: string,
    height?: number,
    weight?: number,
    position?: string,
    backNumber?: number,
    careers?: string[],
    image?: Express.Multer.File
  ): Promise<PlayerPrimitives> {
    const player = await this.playerReader.findById(id);
    if (!player) {
      throw new DomainException('PLAYER', '선수를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    if (name) {
      player.changeName(name);
    }
    if (university) {
      player.changeUniversity(university);
    }
    if (sport) {
      player.changeSport(sport);
    }

    if (department || birth || height || weight || position || backNumber) {
      player.changeProfile(
        department || player.profile.department,
        birth || player.profile.birth,
        height || player.profile.height,
        weight || player.profile.weight,
        position || player.profile.position,
        backNumber || player.profile.backNumber,
        careers || player.profile.careers
      );
    }

    if (image) {
      const imageFile = toFile(image);
      const imageValidation = validateImageFile(imageFile, {
        maxSizeMB: 5,
        strictValidation: true,
      });
      if (!imageValidation.isValid) {
        throw new DomainException('PLAYER', '이미지 파일이 유효하지 않습니다.', HttpStatus.BAD_REQUEST);
      }

      const { url, key } = await this.storageClient.changeFile(
        imageFile,
        this.PROFILE_IMAGE_PATH,
        player.profileImage.key
      );
      player.changeProfileImage(url, key);
    }

    await this.playerPersister.save(player);
    return player.toPrimitives();
  }

  @Transactional()
  async deletePlayer(id: string): Promise<void> {
    const player = await this.playerReader.findById(id);
    if (!player) {
      throw new DomainException('PLAYER', '선수를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    await this.storageClient.deleteFile(player.profileImage.key);
    player.delete();
    await this.playerPersister.save(player);
  }

  async getPlayerById(id: string): Promise<PlayerPrimitives> {
    const player = await this.playerReader.findById(id);
    if (!player) {
      throw new DomainException('PLAYER', '선수를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return player.toPrimitives();
  }

  async getPlayersByFilter(university?: University, sport?: Sport, position?: string): Promise<PlayerPrimitives[]> {
    const players = await this.playerReader.findMany({ university, sport, position });
    return players.map((player) => player.toPrimitives());
  }

  async getPlayerByNameAndUniversityAndSport(
    name: string,
    university: University,
    sport: Sport
  ): Promise<PlayerPrimitives | null> {
    const player = await this.playerReader.findByNameAndUniversityAndSport(name, university, sport);
    return player ? player.toPrimitives() : null;
  }

  @Transactional()
  async likePlayer(playerId: string, count: number): Promise<void> {
    const player = await this.playerReader.findById(playerId);
    if (!player) {
      throw new DomainException('PLAYER', '선수를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    player.incrementLikeCount(count);
    await this.playerPersister.save(player);
  }
}
