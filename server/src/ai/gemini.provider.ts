import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

export interface FileAttachment {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class GeminiProvider {
  private readonly model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  private readonly client: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generates a structured JSON response from a text-only prompt.
   * Used by the 4 existing quick-actions (summarize, rewrite, etc.).
   */
  async generateJson<T>(prompt: string): Promise<T> {
    const model = this.client.getGenerativeModel({ model: this.model });

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const raw = result.response.text().trim();

      const stripped = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const firstJson = this.extractFirstJson(stripped);

      return JSON.parse(firstJson) as T;
    } catch (err: any) {
      this.handleGeminiError(err);
    }
  }

  /**
   * Generates a freeform text response from a prompt with optional file attachments.
   * Used by the new AI chat feature for multimodal analysis.
   */
  async generateWithAttachments(
    prompt: string,
    attachments: FileAttachment[] = [],
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });

    try {
      const parts: Part[] = [];

      // Add file attachments as inline data parts
      for (const file of attachments) {
        parts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.buffer.toString('base64'),
          },
        });
      }

      // Add the text prompt last (so the model sees files first as context)
      parts.push({ text: prompt });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
      });

      return result.response.text().trim();
    } catch (err: any) {
      this.handleGeminiError(err);
    }
  }

  /**
   * Generates a structured JSON response from a prompt with optional file attachments.
   * Useful for agentic chat where the AI needs to return text AND proposed actions (like updating a note).
   */
  async generateWithAttachmentsJson<T>(
    prompt: string,
    attachments: FileAttachment[] = [],
  ): Promise<T> {
    const model = this.client.getGenerativeModel({ model: this.model });

    try {
      const parts: Part[] = [];

      for (const file of attachments) {
        parts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.buffer.toString('base64'),
          },
        });
      }

      parts.push({ text: prompt });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const raw = result.response.text().trim();
      const stripped = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const firstJson = this.extractFirstJson(stripped);
      return JSON.parse(firstJson) as T;
    } catch (err: any) {
      this.handleGeminiError(err);
    }
  }

  // ─── Shared error handler ────────────────────────────────────────────────

  private handleGeminiError(err: any): never {
    console.error('GEMINI ERROR:', err);

    const status = err?.status as number | undefined;
    const message: string = err?.message || '';

    if (status === 429 || message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
      throw new InternalServerErrorException(
        'AI rate limit reached. Please try again in a few minutes.',
      );
    }

    if (status === 503 || message.includes('503') || message.toLowerCase().includes('overloaded') || message.toLowerCase().includes('high demand')) {
      throw new InternalServerErrorException(
        'AI servers are currently overloaded. Please try again in a few seconds.',
      );
    }

    if (message.toLowerCase().includes('safety') || message.toLowerCase().includes('blocked')) {
      throw new BadRequestException(
        'The AI declined the request due to safety filters. Please try a different prompt.',
      );
    }

    if (err instanceof SyntaxError) {
      throw new InternalServerErrorException(
        'The AI returned an unexpected response. Please try again.',
      );
    }

    throw new InternalServerErrorException(
      message || 'An unexpected AI error occurred.',
    );
  }

  // ─── JSON extraction helper ──────────────────────────────────────────────

  private extractFirstJson(text: string): string {
    const start = text.search(/[{\[]/);
    if (start === -1) return text;

    const opener = text[start];
    const closer = opener === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < text.length; i++) {
      const ch = text[i];

      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;

      if (ch === opener) depth++;
      else if (ch === closer) {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }

    return text.slice(start);
  }
}
