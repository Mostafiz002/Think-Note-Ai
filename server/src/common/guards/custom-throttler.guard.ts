import { ThrottlerGuard, ThrottlerRequest, ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, throttler } = requestProps;
    const request = context.switchToHttp().getRequest();
    
    // 1. Professionally exempt GET requests from all rate limiting
    // Since GETs are mostly cached or read-only, we prioritize UX.
    if (request.method === 'GET') {
      return true; 
    }

    // 2. Determine if the current throttler should be applied to this route.
    // By default, we ONLY apply the 'default' throttler.
    // 'short' and 'ai' throttlers must be explicitly requested via @Throttle() decorator.
    
    const throttlerName = throttler.name || 'default';
    
    // Check if the route has explicit throttle metadata
    const reflector = (this as any).reflector as Reflector;
    const throttleMetadata = reflector.get('throttler', context.getHandler());
    const classMetadata = reflector.get('throttler', context.getClass());
    
    const hasExplicitThrottle = !!(throttleMetadata || classMetadata);

    if (throttlerName !== 'default' && !hasExplicitThrottle) {
      // Ignore 'short' and 'ai' limits if the route didn't explicitly ask for them
      return true;
    }

    return super.handleRequest(requestProps);
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new ThrottlerException('Too many requests. Please slow down and try again later.');
  }
}
