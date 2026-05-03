import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '../../../generated/prisma/client';
import { ThrottlerException } from '@nestjs/throttler';

/**
 * Global exception filter
 * Response shape:
 * {
 *   statusCode: number,
 *   error:      string,   // human-readable HTTP status label
 *   message:    string,   // friendly description
 *   path:       string,
 *   timestamp:  string,
 * }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const { statusCode, message } = this.resolveError(exception);

    const responseBody = {
      statusCode,
      error: this.statusLabel(statusCode),
      message,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `[${responseBody.path}] ${statusCode} - ${message}`,
      { stack: (exception as Error)?.stack },
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }

  // ─── Error resolution ────────────────────────────────────────────────────

  private resolveError(exception: unknown): { statusCode: number; message: string } {
    // 1. NestJS HTTP exceptions (UnauthorizedException, NotFoundException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // NestJS validation errors return an array of messages
      if (typeof response === 'object' && response !== null) {
        const r = response as Record<string, unknown>;
        const msg = Array.isArray(r.message)
          ? (r.message as string[]).join(', ')
          : (r.message as string) ?? exception.message;
        return { statusCode: status, message: msg };
      }

      return { statusCode: status, message: exception.message };
    }

    // 2. Throttler (rate limit exceeded)
    if (exception instanceof ThrottlerException) {
      return {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please slow down and try again later.',
      };
    }

    // 3. Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaKnownError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data provided.',
      };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database connection failed. Please try again later.',
      };
    }

    // 4. Generic / unhandled errors
    const msg = (exception as Error)?.message;
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.isTechnical(msg)
        ? 'An unexpected error occurred. Please try again later.'
        : (msg ?? 'An unexpected error occurred.'),
    };
  }

  private handlePrismaKnownError(
    err: Prisma.PrismaClientKnownRequestError,
  ): { statusCode: number; message: string } {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const field = (err.meta?.target as string[] | undefined)?.[0] ?? 'field';
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${field} already exists.`,
        };
      }
      case 'P2025':
        // Record not found
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found.',
        };
      case 'P2003':
        // Foreign key constraint
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Operation failed due to a related record constraint.',
        };
      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid relation in the provided data.',
        };
      default:
        this.logger.warn(`Unhandled Prisma error code: ${err.code}`);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred. Please try again later.',
        };
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /** Returns true if the message looks like a raw internal/stack message. */
  private isTechnical(msg?: string): boolean {
    if (!msg) return true;
    const technical = ['ECONNREFUSED', 'Cannot read', 'undefined', 'null', 'at Object.', 'stack:'];
    return technical.some((t) => msg.includes(t));
  }

  private statusLabel(status: number): string {
    const labels: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    };
    return labels[status] ?? 'Error';
  }
}
