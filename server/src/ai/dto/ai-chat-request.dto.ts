import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AiChatRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Instruction cannot be empty.' })
  @MaxLength(2000, { message: 'Instruction must be 2000 characters or fewer.' })
  instruction!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  noteId?: number;
}
