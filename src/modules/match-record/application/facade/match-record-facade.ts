import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { StorageClient } from '~/libs/common/storage/storage.client';
import { toFile, validateImageFile } from '~/libs/common/storage/storage.util';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { MatchRecordParams } from '~/modules/match-record/application/dto/match-record-params.dto';
import { PlayerMatchRecord } from '~/modules/match-record/application/dto/player-match-record.dto';
import { MatchRecordFacade } from '~/modules/match-record/application/port/in/match-record-facade.port';
import { MatchRecordPersister } from '~/modules/match-record/application/service/match-record.persister';
import { MatchRecordReader } from '~/modules/match-record/application/service/match-record.reader';
import { MatchRecord, MatchRecordPrimitives } from '~/modules/match-record/domain/model/match-record';
import { MatchRecordValidateService } from '~/modules/match-record/domain/service/match-record-validate.service';
import { PlayerInvoker } from '~/modules/player/application/port/in/player-invoker.port';

@Injectable()
export class MatchRecordFacadeImpl extends MatchRecordFacade {
  private readonly MATCH_RECORD_IMAGE_PATH = 'match-record/image';

  constructor(
    private readonly matchRecordReader: MatchRecordReader,
    private readonly matchRecordPersister: MatchRecordPersister,
    private readonly matchRecordValidateService: MatchRecordValidateService,

    private readonly playerInvoker: PlayerInvoker,
    private readonly storageClient: StorageClient
  ) {
    super();
  }

  async getMatchRecord(sport: Sport, league: string): Promise<MatchRecordPrimitives> {
    const matchRecord = await this.matchRecordReader.findBySportAndLeague(sport, league);
    if (!matchRecord) {
      throw new DomainException('MATCH_RECORD', '전적 정보를 찾을 수 없습니다', HttpStatus.NOT_FOUND);
    }
    return matchRecord.toPrimitives();
  }

  async getMatchRecordsBySport(sport: Sport): Promise<MatchRecordPrimitives[]> {
    const matchRecords = await this.matchRecordReader.findAllBySport(sport);
    return matchRecords.map((record) => record.toPrimitives());
  }

  async getAllLeagueNamesBySport(sport: Sport): Promise<string[]> {
    const leagueNames = await this.matchRecordReader.findAllLeagueNamesBySport(sport);
    return leagueNames;
  }

  @Transactional()
  async updateMatchRecordsBySport(sport: Sport, records: MatchRecordParams[]): Promise<MatchRecordPrimitives[]> {
    for (const params of records) {
      if (params.sport !== sport) {
        throw new DomainException('MATCH_RECORD', '스포츠 종류가 일치하지 않습니다', HttpStatus.BAD_REQUEST);
      }
    }

    const matchRecords = await Promise.all(
      records.map(async (params) => {
        const { sport, league, universityStats, playerStatsWithCategory } = params;

        const playerStatsWithCategoryWithId = await Promise.all(
          playerStatsWithCategory.map(async (category) => {
            const playersWithId = await Promise.all(
              category.players.map(async (player) => {
                const foundPlayer = await this.playerInvoker.getPlayerByNameAndUniversityAndSport(
                  player.name,
                  player.university,
                  sport
                );

                return {
                  playerId: foundPlayer ? foundPlayer.id : null,
                  name: player.name,
                  university: player.university,
                  position: player.position,
                  stats: player.stats,
                };
              })
            );

            return {
              category: category.category,
              players: playersWithId,
            };
          })
        );

        return MatchRecord.create(sport, league, null, null, universityStats, playerStatsWithCategoryWithId);
      })
    );

    // 다른 리그 간 스키마 다른 경우 존재...
    // this.matchRecordValidateService.validateCrossRecords(matchRecords);

    const existingRecords = await this.matchRecordReader.findAllBySport(sport);

    for (const existingRecord of existingRecords) {
      const newRecord = matchRecords.find((record) => record.id === existingRecord.id);
      if (!newRecord) {
        if (existingRecord.leagueImage !== null) {
          await this.storageClient.deleteFile(existingRecord.leagueImage.key);
        }
        existingRecord.delete();
      } else {
        newRecord.setImage(existingRecord.leagueImage);
      }
    }

    await this.matchRecordPersister.saveAll([...existingRecords, ...matchRecords]);

    return matchRecords.map((record) => record.toPrimitives());
  }

  @Transactional()
  async setLeagueImage(
    sport: Sport,
    league: string,
    image: Express.Multer.File | null
  ): Promise<MatchRecordPrimitives> {
    const matchRecord = await this.matchRecordReader.findBySportAndLeague(sport, league);
    if (!matchRecord) {
      throw new DomainException('MATCH_RECORD', '전적 정보를 찾을 수 없습니다', HttpStatus.NOT_FOUND);
    }

    let newImage: { url: string; key: string } | null = null;

    if (image) {
      const imageFile = toFile(image);
      const imageValidation = validateImageFile(imageFile, {
        maxSizeMB: 5,
        strictValidation: true,
      });
      if (!imageValidation.isValid) {
        throw new DomainException('MATCH_RECORD', '이미지 파일이 유효하지 않습니다.', HttpStatus.BAD_REQUEST);
      }
      newImage = await this.storageClient.uploadFile(imageFile, this.MATCH_RECORD_IMAGE_PATH);
    }

    if (matchRecord.leagueImage !== null) {
      await this.storageClient.deleteFile(matchRecord.leagueImage.key);
    }

    matchRecord.setImage(newImage);
    await this.matchRecordPersister.save(matchRecord);

    return matchRecord.toPrimitives();
  }

  async getPlayerMatchRecord(playerId: string): Promise<PlayerMatchRecord> {
    return this.matchRecordReader.findPlayerMatchRecords(playerId);
  }
}
