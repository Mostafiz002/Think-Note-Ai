import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

      // Strip any markdown code fences the model may wrap around JSON
      const stripped = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      // Gemini can occasionally return multiple concatenated JSON objects.
      // We extract only the first complete JSON structure as a defensive measure.
      const firstJson = this.extractFirstJson(stripped);

      return JSON.parse(firstJson) as T;
    } catch (err: any) {
      console.error('GEMINI ERROR:', err);

      const status = err?.status as number | undefined;
      const message: string = err?.message || '';

      // 429 / quota exceeded
      if (status === 429 || message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
        throw new InternalServerErrorException(
          'AI rate limit reached. Please try again in a few minutes.',
        );
      }

      // 503 / model overloaded
      if (status === 503 || message.includes('503') || message.toLowerCase().includes('overloaded') || message.toLowerCase().includes('high demand')) {
        throw new InternalServerErrorException(
          'AI servers are currently overloaded. Please try again in a few seconds.',
        );
      }

      // Safety filter triggered
      if (message.toLowerCase().includes('safety') || message.toLowerCase().includes('blocked')) {
        throw new BadRequestException(
          'The AI declined the request due to safety filters. Please try a different prompt.',
        );
      }

      // JSON parse errors — model returned malformed output
      if (err instanceof SyntaxError) {
        throw new InternalServerErrorException(
          'The AI returned an unexpected response. Please try again.',
        );
      }

      throw new InternalServerErrorException(
        message || 'An unexpected AI error occurred.',
      );
    }
  }

  /**
   * Extracts the first complete JSON object or array from a string.
   * This guards against cases where the model concatenates multiple JSON blocks.
   */
  private extractFirstJson(text: string): string {
    const start = text.search(/[{\[]/);
    if (start === -1) return text; // No JSON found — let JSON.parse throw naturally

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

    return text.slice(start); // Return from start to end if never closed
  }
}
