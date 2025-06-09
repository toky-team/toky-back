import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';

export const PaginatedResultDtoFactory = <T>(model: Type<T>, name: string): Type<PaginatedResult<T>> => {
  class PaginatedResultDto implements PaginatedResult<T> {
    @ApiProperty({
      isArray: true,
      type: () => model,
      description: '페이지네이션된 결과 목록.',
    })
    items: T[];

    @ApiProperty({
      type: String,
      nullable: true,
      description: '페이지네이션을 위한 커서. 다음 페이지가 없으면 null.',
    })
    nextCursor: string | null;

    @ApiProperty({
      type: Boolean,
      description: '다음 페이지가 있는지 여부.',
    })
    hasNext: boolean;
  }

  Object.defineProperty(PaginatedResultDto, 'name', { value: name });

  return PaginatedResultDto;
};
