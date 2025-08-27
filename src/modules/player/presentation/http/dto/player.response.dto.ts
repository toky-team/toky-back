import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerPrimitives } from '~/modules/player/domain/model/player';

export class PlayerResponseDto {
  @ApiProperty({
    description: '선수 ID',
  })
  id: string;

  @ApiProperty({
    description: '선수 이름',
  })
  name: string;

  @ApiProperty({
    description: '소속 대학',
    enum: University,
  })
  university: University;

  @ApiProperty({
    description: '종목',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description: '학과 및 학번',
  })
  department: string;

  @ApiProperty({
    description: '생년월일 (YYYY.MM.DD)',
  })
  birth: string;

  @ApiProperty({
    description: '신장 (cm)',
  })
  height: number;

  @ApiProperty({
    description: '체중 (kg)',
  })
  weight: number;

  @ApiProperty({
    description: '포지션',
  })
  position: string;

  @ApiProperty({
    description: '등번호',
  })
  backNumber: number;

  @ApiProperty({
    description: '경력',
  })
  careers: string[];

  @ApiProperty({
    description: '프로필 이미지 URL',
  })
  imageUrl: string;

  @ApiProperty({
    description: '좋아요 수',
  })
  likeCount: number;

  @ApiProperty({
    description: '주요 선수 여부',
  })
  isPrimary: boolean;

  static fromPrimitives(primitives: PlayerPrimitives): PlayerResponseDto {
    const dto = new PlayerResponseDto();
    dto.id = primitives.id;
    dto.name = primitives.name;
    dto.university = primitives.university;
    dto.sport = primitives.sport;
    dto.department = primitives.department;
    dto.birth = primitives.birth;
    dto.height = primitives.height;
    dto.weight = primitives.weight;
    dto.position = primitives.position;
    dto.backNumber = primitives.backNumber;
    dto.careers = primitives.careers;
    dto.imageUrl = primitives.imageUrl;
    dto.likeCount = primitives.likeCount;
    dto.isPrimary = primitives.isPrimary;

    return dto;
  }
}
