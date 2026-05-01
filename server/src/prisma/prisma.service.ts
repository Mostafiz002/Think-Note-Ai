import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL ?? 'file:./prisma/notes.db',
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    try {
      // Enable WAL mode for better concurrency and performance
      await this.$executeRawUnsafe(`PRAGMA journal_mode=WAL;`);
      await this.$executeRawUnsafe(`PRAGMA synchronous=NORMAL;`);
      this.logger.log('SQLite WAL mode enabled');
    } catch (err) {
      this.logger.error('Failed to enable WAL mode', err);
    }
  }
}
