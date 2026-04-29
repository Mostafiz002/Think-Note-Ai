import { NoteContentType } from '../../../generated/prisma/client';
import {
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateNoteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(NoteContentType)
  contentType?: NoteContentType;

  @ValidateIf((dto: CreateNoteDto) => dto.contentType !== NoteContentType.JSON)
  @IsOptional()
  @IsString()
  markdownContent?: string;

  @ValidateIf((dto: CreateNoteDto) => dto.contentType === NoteContentType.JSON)
  @IsOptional()
  @IsObject()
  jsonContent?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(1)
  folderId?: number;
}
