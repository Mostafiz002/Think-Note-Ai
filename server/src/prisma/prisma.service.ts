import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./prisma/notes.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;

    const adapter = new PrismaLibSql({
      url,
      authToken,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to LibSQL/Turso');
    
    if (!process.env.TURSO_DATABASE_URL) {
      try {
        await this.$executeRawUnsafe(`PRAGMA journal_mode=WAL;`);
        await this.$executeRawUnsafe(`PRAGMA synchronous=NORMAL;`);
        this.logger.log('Local SQLite WAL mode enabled');
      } catch (err) {
        this.logger.warn('Failed to enable local WAL mode (ignoring for remote DB)', err);
      }
    }
  }
}
