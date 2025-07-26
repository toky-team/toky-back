import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { MatchRecordParams } from '~/modules/match-record/application/dto/match-record-params.dto';
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
        const { sport, league, universityRankings, playerRankings } = params;

        // 선수 ID 값 초기화
        const playerWithIdRankings: {
          category: string;
          players: {
            playerId: string | null;
            rank: number;
            name: string;
            university: University;
            position: string;
            stats: Record<string, number>;
          }[];
        }[] = [];
        for (const playerRanking of playerRankings) {
          playerWithIdRankings.push({
            category: playerRanking.category,
            players: playerRanking.players.map((player) => ({
              ...player,
              playerId: null, // 초기값은 null로 설정
            })),
          });
        }

        // 선수 ID를 조회하여 설정
        for (const playerRanking of playerWithIdRankings) {
          for (const player of playerRanking.players) {
            const foundPlayer = await this.playerInvoker.getPlayerByNameAndUniversityAndSport(
              player.name,
              player.university,
              sport
            );
            if (foundPlayer) {
              player.playerId = foundPlayer.id;
            }
          }
        }
        return MatchRecord.create(sport, league, universityRankings, playerWithIdRankings);
      })
    );
    this.matchRecordValidateService.validateAll(matchRecords);

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
}
