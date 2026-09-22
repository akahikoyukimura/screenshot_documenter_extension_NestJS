import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;
}