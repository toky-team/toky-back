import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBetQuestionRequestDto {
  @ApiProperty({
    description: '질문 ID',
    example: 'c91e4a0b-d7af-4959-b085-675550ecfa86',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @ApiProperty({
    description: '질문 내용',
    example: '이 경기는 누가 이길까요?',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    description: '선택지',
    example: ['option1', 'option2'],
    type: [String],
  })
  @IsNotEmpty()
  @IsString({ each: true })
  options: string[];
}
