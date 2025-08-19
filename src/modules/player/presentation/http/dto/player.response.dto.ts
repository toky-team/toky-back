import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerWithLikeInfoDto } from '~/modules/player/application/dto/player-with-like-info.dto';
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

  @ApiPropertyOptional({
    description: '사용자가 좋아요를 눌렀는지 여부',
  })
  isLikedByUser?: boolean;

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

    return dto;
  }

  static fromResult(result: PlayerWithLikeInfoDto): PlayerResponseDto {
    const dto = new PlayerResponseDto();
    dto.id = result.id;
    dto.name = result.name;
    dto.university = result.university;
    dto.sport = result.sport;
    dto.department = result.department;
    dto.birth = result.birth;
    dto.height = result.height;
    dto.weight = result.weight;
    dto.position = result.position;
    dto.backNumber = result.backNumber;
    dto.careers = result.careers;
    dto.imageUrl = result.imageUrl;
    dto.likeCount = result.likeCount;
    dto.isLikedByUser = result.isLikedByUser;

    return dto;
  }
}
