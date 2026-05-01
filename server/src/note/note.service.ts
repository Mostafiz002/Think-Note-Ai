import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note, NoteContentType, Prisma } from '../../generated/prisma/client';
import { ListNotesDto } from './dto/list-notes.dto';
import { MoveNoteFolderDto } from './dto/move-note-folder.dto';
import { SearchNotesDto } from './dto/search-notes.dto';
import Redis from 'ioredis';

@Injectable()
export class NoteService {
  private logger = new Logger(NoteService.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly prismaService: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: number) {
    const contentType = createNoteDto.contentType ?? NoteContentType.MARKDOWN;

    if (createNoteDto.folderId) {
      await this.ensureFolderOwnership(createNoteDto.folderId, userId);
    }

    const data: Prisma.NoteUncheckedCreateInput = {
      title: createNoteDto.title?.trim() || 'Untitled',
      contentType,
      userId,
      folderId: createNoteDto.folderId,
    };

    if (contentType === NoteContentType.MARKDOWN) {
      const content = createNoteDto.markdownContent ?? '';
      data.markdownContent = content;
      data.body = content;
      data.jsonContent = Prisma.JsonNull;
    } else {
      data.body = null;
      data.markdownContent = null;
      data.jsonContent = (createNoteDto.jsonContent ??
        {}) as Prisma.InputJsonValue;
    }

    const note = await this.prismaService.note.create({
      data,
    });

    this.logger.log('New note has been created');
    
    // Invalidate list cache
    await this.invalidateUserCache(userId);
    
    return note;
  }

  async findAll(query: ListNotesDto, userId: number) {
    const cacheKey = `user:${userId}:notes:${JSON.stringify(query)}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      this.logger.log(`Serving notes from cache for user ${userId}`);
      return JSON.parse(cached);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = this.buildListWhereInput(query, userId);

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          folder: true,
          noteTags: {
            include: { tag: true },
          },
        },
      }),
      this.prismaService.note.count({ where }),
    ]);

    const result = {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };

    // Cache the result
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', this.CACHE_TTL);
    
    return result;
  }

  async findOne(id: number, userId: number) {
    const cacheKey = `user:${userId}:note:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      this.logger.log(`Serving note ${id} from cache`);
      return JSON.parse(cached);
    }

    const note = await this.ensureOwnership(id, userId);
    
    await this.redis.set(cacheKey, JSON.stringify(note), 'EX', this.CACHE_TTL);
    
    return note;
  }

  async update(id: number, updateNoteDto: UpdateNoteDto, userId: number) {
    const note = await this.ensureOwnership(id, userId);
    const contentType = updateNoteDto.contentType ?? note.contentType;

    if (updateNoteDto.folderId) {
      await this.ensureFolderOwnership(updateNoteDto.folderId, userId);
    }

    const data: Prisma.NoteUncheckedUpdateInput = {
      title:
        updateNoteDto.title !== undefined
          ? updateNoteDto.title.trim() || 'Untitled'
          : undefined,
      contentType,
      folderId: updateNoteDto.folderId,
    };

    if (contentType === NoteContentType.MARKDOWN) {
      if (updateNoteDto.markdownContent !== undefined) {
        data.markdownContent = updateNoteDto.markdownContent ?? '';
        data.body = updateNoteDto.markdownContent ?? '';
      }
      data.jsonContent = Prisma.JsonNull;
    } else {
      data.body = null;
      data.markdownContent = null;
      if (updateNoteDto.jsonContent !== undefined) {
        data.jsonContent = (updateNoteDto.jsonContent ??
          {}) as Prisma.InputJsonValue;
      }
    }

    const updated = await this.prismaService.note.update({
      where: { id },
      data,
    });

    // Invalidate caches
    await this.invalidateUserCache(userId, id);

    return updated;
  }

  async remove(id: number, userId: number) {
    await this.ensureOwnership(id, userId);
    await this.prismaService.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    
    // Invalidate caches
    await this.invalidateUserCache(userId, id);
    
    return 'Moved to trash';
  }

  // --- Helper Methods ---

  private async invalidateUserCache(userId: number, noteId?: number) {
    // 1. Delete all note list caches for this user
    // We use a pattern to find all keys like user:1:notes:*
    const keys = await this.redis.keys(`user:${userId}:notes:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    // 2. Delete specific note cache if provided
    if (noteId) {
      await this.redis.del(`user:${userId}:note:${noteId}`);
    }
    
    this.logger.log(`Invalidated cache for user ${userId}${noteId ? ` and note ${noteId}` : ''}`);
  }

  private async ensureOwnership(id: number, userId: number): Promise<Note> {
    const note = await this.prismaService.note.findFirst({
      where: { id },
      include: {
        folder: true,
        noteTags: {
          include: { tag: true },
        },
        outgoingLinks: {
          include: {
            targetNote: {
              select: { id: true, title: true },
            },
          },
        },
        incomingLinks: {
          include: {
            sourceNote: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!note) throw new NotFoundException('Note not Found');
    if (note.userId !== userId) throw new ForbiddenException('Not Allowed!');

    return note;
  }

  private buildListWhereInput(
    query: ListNotesDto,
    userId: number,
  ): Prisma.NoteWhereInput {
    const includeArchived = query.includeArchived ?? false;
    const includeTrashed = query.includeTrashed ?? false;
    const search = query.search?.trim();

    return {
      userId,
      archivedAt: includeArchived ? undefined : null,
      deletedAt: includeTrashed ? undefined : null,
      contentType: query.contentType,
      folderId: query.folderId,
      OR: search
        ? [
            { title: { contains: search } },
            { markdownContent: { contains: search } },
          ]
        : undefined,
    };
  }

  // ... (Other methods remain same)
  
  async search(query: SearchNotesDto, userId: number) {
    // Search is usually too dynamic for simple caching, 
    // but you could cache it here if needed using the same logic as findAll.
    const term = query.q?.trim();
    if (!term) throw new BadRequestException('q is required for search');

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const pattern = `%${term.toLowerCase()}%`;
    const where = this.buildRawSearchWhereSql(query, userId, pattern);

    const [items, countRows] = await this.prismaService.$transaction([
      this.prismaService.$queryRaw<any[]>(Prisma.sql`
        SELECT
          n.id,
          n.title,
          n.contentType,
          n.markdownContent,
          n.archivedAt,
          n.deletedAt,
          n.createdAt,
          n.updatedAt,
          n.userId,
          n.folderId,
          (
            CASE WHEN lower(n.title) LIKE ${pattern} THEN 3 ELSE 0 END +
            CASE WHEN lower(coalesce(n.markdownContent, '')) LIKE ${pattern} THEN 1 ELSE 0 END
          ) AS score
        FROM "Note" n
        ${where}
        ORDER BY score DESC, n.updatedAt DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `),
      this.prismaService.$queryRaw<Array<{ total: number }>>(Prisma.sql`
        SELECT COUNT(*) as total
        FROM "Note" n
        ${where}
      `),
    ]);

    const total = Number(countRows[0]?.total ?? 0);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      search: {
        mode: 'keyword',
        semantic: {
          ready: false,
          provider: null,
          nextStep: 'Plug embeddings + vector index in AI module',
        },
      },
    };
  }

  private buildRawSearchWhereSql(
    query: SearchNotesDto,
    userId: number,
    pattern: string,
  ) {
    const filters: Prisma.Sql[] = [
      Prisma.sql`n.userId = ${userId}`,
      Prisma.sql`(lower(n.title) LIKE ${pattern} OR lower(coalesce(n.markdownContent, '')) LIKE ${pattern})`,
    ];

    if (!query.includeArchived) filters.push(Prisma.sql`n.archivedAt IS NULL`);
    if (!query.includeTrashed) filters.push(Prisma.sql`n.deletedAt IS NULL`);
    if (query.contentType)
      filters.push(Prisma.sql`n.contentType = ${query.contentType}`);
    if (query.folderId)
      filters.push(Prisma.sql`n.folderId = ${query.folderId}`);

    return Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`;
  }
  
  async archive(id: number, userId: number) {
    await this.ensureOwnership(id, userId);
    const res = await this.prismaService.note.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
    await this.invalidateUserCache(userId, id);
    return res;
  }

  async unarchive(id: number, userId: number) {
    await this.ensureOwnership(id, userId);
    const res = await this.prismaService.note.update({
      where: { id },
      data: { archivedAt: null },
    });
    await this.invalidateUserCache(userId, id);
    return res;
  }

  async moveToFolder(
    noteId: number,
    moveNoteFolderDto: MoveNoteFolderDto,
    userId: number,
  ) {
    await this.ensureOwnership(noteId, userId);
    if (moveNoteFolderDto.folderId) {
      await this.ensureFolderOwnership(moveNoteFolderDto.folderId, userId);
    }

    const res = await this.prismaService.note.update({
      where: { id: noteId },
      data: { folderId: moveNoteFolderDto.folderId ?? null },
      include: {
        folder: true,
        noteTags: { include: { tag: true } },
      },
    });
    await this.invalidateUserCache(userId, noteId);
    return res;
  }

  async restore(id: number, userId: number) {
    await this.ensureOwnership(id, userId);
    const res = await this.prismaService.note.update({
      where: { id },
      data: { deletedAt: null },
    });
    await this.invalidateUserCache(userId, id);
    return res;
  }

  async attachTag(noteId: number, tagId: number, userId: number) {
    await this.ensureOwnership(noteId, userId);
    await this.ensureTagOwnership(tagId, userId);

    await this.prismaService.noteTag.upsert({
      where: { noteId_tagId: { noteId, tagId } },
      update: {},
      create: { noteId, tagId },
    });

    const res = await this.findOneWithTags(noteId, userId);
    await this.invalidateUserCache(userId, noteId);
    return res;
  }

  async detachTag(noteId: number, tagId: number, userId: number) {
    await this.ensureOwnership(noteId, userId);
    await this.ensureTagOwnership(tagId, userId);

    await this.prismaService.noteTag.deleteMany({
      where: { noteId, tagId },
    });

    const res = await this.findOneWithTags(noteId, userId);
    await this.invalidateUserCache(userId, noteId);
    return res;
  }

  private async findOneWithTags(id: number, userId: number) {
    const note = await this.prismaService.note.findFirst({
      where: { id, userId },
      include: {
        folder: true,
        noteTags: {
          include: { tag: true },
        },
      },
    });

    if (!note) throw new NotFoundException('Note not Found');
    return note;
  }
  
  private async ensureTagOwnership(tagId: number, userId: number) {
    const tag = await this.prismaService.tag.findFirst({
      where: { id: tagId },
    });
    if (!tag) throw new NotFoundException('Tag not found');
    if (tag.userId !== userId) throw new ForbiddenException('Not Allowed!');
  }

  private async ensureFolderOwnership(folderId: number, userId: number) {
    const folder = await this.prismaService.folder.findFirst({
      where: { id: folderId },
    });
    if (!folder) throw new NotFoundException('Folder not found');
    if (folder.userId !== userId) throw new ForbiddenException('Not Allowed!');
  }

  async getLinks(noteId: number, userId: number) {
    await this.ensureOwnership(noteId, userId);

    const [outgoing, incoming] = await this.prismaService.$transaction([
      this.prismaService.noteLink.findMany({
        where: { sourceNoteId: noteId },
        include: {
          targetNote: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      this.prismaService.noteLink.findMany({
        where: { targetNoteId: noteId },
        include: {
          sourceNote: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
    ]);

    return { outgoing, incoming };
  }

  async linkNote(sourceNoteId: number, targetNoteId: number, userId: number) {
    if (sourceNoteId === targetNoteId) {
      throw new BadRequestException('A note cannot be linked to itself');
    }

    await this.ensureOwnership(sourceNoteId, userId);
    await this.ensureOwnership(targetNoteId, userId);

    await this.prismaService.noteLink.upsert({
      where: { sourceNoteId_targetNoteId: { sourceNoteId, targetNoteId } },
      update: {},
      create: { sourceNoteId, targetNoteId },
    });

    const res = await this.getLinks(sourceNoteId, userId);
    await this.invalidateUserCache(userId, sourceNoteId);
    return res;
  }

  async unlinkNote(sourceNoteId: number, targetNoteId: number, userId: number) {
    await this.ensureOwnership(sourceNoteId, userId);
    await this.ensureOwnership(targetNoteId, userId);

    await this.prismaService.noteLink.deleteMany({
      where: { sourceNoteId, targetNoteId },
    });

    const res = await this.getLinks(sourceNoteId, userId);
    await this.invalidateUserCache(userId, sourceNoteId);
    return res;
  }
}
