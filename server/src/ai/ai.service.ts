import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiNoteRequestDto } from './dto/ai-note-request.dto';
import { GeminiProvider, FileAttachment } from './gemini.provider';

type AiOutput = {
  summary?: string;
  rewrittenContent?: string;
  title?: string;
  keyPoints?: string[];
};

@Injectable()
export class AiService {
  private logger = new Logger(AiService.name);
  private requestCounts = new Map<number, number>();
  private readonly MAX_REQUESTS = 20;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  private checkLimit(userId: number) {
    const current = this.requestCounts.get(userId) ?? 0;
    if (current >= this.MAX_REQUESTS) {
      throw new ForbiddenException(
        `AI limit reached (${this.MAX_REQUESTS} requests). Please try again later.`,
      );
    }
    this.requestCounts.set(userId, current + 1);
  }

  // ─── New: Freeform AI Chat ───────────────────────────────────────────────

  async chat(
    instruction: string,
    userId: number,
    noteId?: number,
    files?: Express.Multer.File[],
  ) {
    this.checkLimit(userId);

    // Build the prompt with optional note context
    let prompt = '';

    if (noteId) {
      const note = await this.getOwnedNote(noteId, userId);
      const content = this.getContent(note);
      prompt += `Here is the context of the user's note:\n\nTitle: ${note.title}\nContent:\n${content}\n\n---\n\n`;
    }

    prompt += `User instruction: ${instruction}`;

    if (files && files.length > 0) {
      prompt += `\n\nThe user has attached ${files.length} file(s). Please analyze them carefully and incorporate your findings into your response.`;
    }

    // Convert Multer files to our FileAttachment format
    const attachments: FileAttachment[] = (files ?? []).map((f) => ({
      buffer: f.buffer,
      mimeType: f.mimetype,
      originalName: f.originalname,
    }));

    this.logger.log(
      `AI Chat: user=${userId}, noteId=${noteId ?? 'none'}, files=${attachments.length}, instructionLen=${instruction.length}`,
    );

    const response = await this.geminiProvider.generateWithAttachments(
      prompt,
      attachments,
    );

    return { response };
  }

  // ─── Existing: Quick Actions ─────────────────────────────────────────────

  async summarizeNote(dto: AiNoteRequestDto, userId: number) {
    this.checkLimit(userId);
    const note = await this.getOwnedNote(dto.noteId, userId);
    const prompt = this.buildPrompt(
      'summarize',
      note.title,
      this.getContent(note),
      dto.instruction,
    );
    const result = await this.geminiProvider.generateJson<AiOutput>(prompt);
    console.log('AI RESULT:', result);

    const summary = result.summary ?? '';
    if (summary) {
      await this.prismaService.note.update({
        where: { id: note.id },
        data: { summary },
      });
    }

    return {
      noteId: note.id,
      summary,
    };
  }

  async rewriteNote(dto: AiNoteRequestDto, userId: number) {
    this.checkLimit(userId);
    const note = await this.getOwnedNote(dto.noteId, userId);
    const prompt = this.buildPrompt(
      'rewrite',
      note.title,
      this.getContent(note),
      dto.instruction,
    );
    const result = await this.geminiProvider.generateJson<AiOutput>(prompt);

    return {
      noteId: note.id,
      rewrittenContent: result.rewrittenContent ?? '',
    };
  }

  async generateTitle(dto: AiNoteRequestDto, userId: number) {
    this.checkLimit(userId);
    const note = await this.getOwnedNote(dto.noteId, userId);
    const prompt = this.buildPrompt(
      'generate_short_title',
      note.title,
      this.getContent(note),
      dto.instruction,
    );
    const result = await this.geminiProvider.generateJson<AiOutput>(prompt);

    return {
      noteId: note.id,
      title: result.title ?? '',
    };
  }

  async extractKeyPoints(dto: AiNoteRequestDto, userId: number) {
    this.checkLimit(userId);
    const note = await this.getOwnedNote(dto.noteId, userId);
    const prompt = this.buildPrompt(
      'extract_key_points',
      note.title,
      this.getContent(note),
      dto.instruction,
    );
    const result = await this.geminiProvider.generateJson<AiOutput>(prompt);

    const keyPoints = result.keyPoints ?? [];
    if (keyPoints.length > 0) {
      await this.prismaService.note.update({
        where: { id: note.id },
        data: { keyPoints },
      });
    }

    return {
      noteId: note.id,
      keyPoints,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private getContent(note: {
    markdownContent: string | null;
    jsonContent: unknown;
  }) {
    if (note.markdownContent) return note.markdownContent;
    if (note.jsonContent) return JSON.stringify(note.jsonContent);
    return '';
  }

  private buildPrompt(
    task:
      | 'summarize'
      | 'rewrite'
      | 'generate_short_title'
      | 'extract_key_points',
    title: string,
    content: string,
    instruction?: string,
  ) {
    return JSON.stringify({
      task,
      instruction: instruction ?? null,
      input: {
        title,
        content,
      },
      outputSchema: {
        summary: 'string',
        rewrittenContent: 'string',
        title: 'string',
        keyPoints: ['string'],
      },
      rules: [
        'Return valid JSON only.',
        'Do not include markdown fences.',
        'Keep output concise and useful.',
      ],
    });
  }

  private async getOwnedNote(noteId: number, userId: number) {
    const note = await this.prismaService.note.findFirst({
      where: { id: noteId },
    });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) throw new ForbiddenException('Not allowed');
    return note;
  }
}
