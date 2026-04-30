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
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured',
      );
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

      const clean = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(clean) as T;
    } catch (err: any) {
      console.error('GEMINI ERROR:', err);

      const message = err?.message || '';
      
      if (message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
        throw new InternalServerErrorException(
          'AI rate limit reached. Please try again in a few minutes.',
        );
      }

      if (message.includes('503') || message.toLowerCase().includes('overloaded') || message.toLowerCase().includes('high demand')) {
        throw new InternalServerErrorException(
          'AI servers are currently overloaded due to high demand. Please try again in a few seconds.',
        );
      }

      if (message.toLowerCase().includes('safety') || message.toLowerCase().includes('blocked')) {
        throw new BadRequestException(
          'The AI declined the request due to safety filters. Please try a different prompt.',
        );
      }

      throw new InternalServerErrorException(
        err?.message || 'Gemini request failed',
      );
    }
  }
}
