import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

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
  constructor(
    private readonly matchRecordReader: MatchRecordReader,
    private readonly matchRecordPersister: MatchRecordPersister,
    private readonly matchRecordValidateService: MatchRecordValidateService,

    private readonly playerInvoker: PlayerInvoker
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

        return MatchRecord.create(sport, league, universityStats, playerStatsWithCategoryWithId);
      })
    );

    this.matchRecordValidateService.validateCrossRecords(matchRecords);

    const existingRecords = await this.matchRecordReader.findAllBySport(sport);

    const deletedRecords = existingRecords.filter(
      (record) => !matchRecords.some((newRecord) => newRecord.id === record.id)
    );

    for (const record of deletedRecords) {
      record.delete();
    }

    await this.matchRecordPersister.saveAll([...deletedRecords, ...matchRecords]);

    return matchRecords.map((record) => record.toPrimitives());
  }

  async getPlayerMatchRecord(playerId: string): Promise<PlayerMatchRecord> {
    const playerMatchRecord = await this.matchRecordReader.findPlayerMatchRecords(playerId);

    if (!playerMatchRecord) {
      throw new DomainException(
        'MATCH_RECORD',
        `선수의 전적 정보를 찾을 수 없습니다: ${playerId}`,
        HttpStatus.NOT_FOUND
      );
    }

    return playerMatchRecord;
  }
}
