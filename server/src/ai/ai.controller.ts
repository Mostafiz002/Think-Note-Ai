import {
  Body,
  Controller,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/auth/auth.guard';
import { AiService } from './ai.service';
import { AiNoteRequestDto } from './dto/ai-note-request.dto';
import { AiChatRequestDto } from './dto/ai-chat-request.dto';

@Controller('api/v1/ai')
@UseGuards(AuthGuard)
@Throttle({ ai: { limit: 5, ttl: 60000 } })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'image/png',
          'image/jpeg',
          'image/webp',
          'image/gif',
          'application/pdf',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  chat(
    @Body() dto: AiChatRequestDto,
    @Request() req: { user: { sub: number } },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    console.log('AI CHAT ENDPOINT HIT:', { instruction: dto.instruction, noteId: dto.noteId, filesCount: files?.length });
    return this.aiService.chat(
      dto.instruction,
      req.user.sub,
      dto.noteId ? Number(dto.noteId) : undefined,
      files,
    );
  }

  @Post('summarize')
  summarize(
    @Body() dto: AiNoteRequestDto,
    @Request() req: { user: { sub: number } },
  ) {
    return this.aiService.summarizeNote(dto, req.user.sub);
  }

  @Post('rewrite')
  rewrite(
    @Body() dto: AiNoteRequestDto,
    @Request() req: { user: { sub: number } },
  ) {
    return this.aiService.rewriteNote(dto, req.user.sub);
  }

  @Post('generate-title')
  generateTitle(
    @Body() dto: AiNoteRequestDto,
    @Request() req: { user: { sub: number } },
  ) {
    return this.aiService.generateTitle(dto, req.user.sub);
  }

  @Post('key-points')
  keyPoints(
    @Body() dto: AiNoteRequestDto,
    @Request() req: { user: { sub: number } },
  ) {
    return this.aiService.extractKeyPoints(dto, req.user.sub);
  }
}
