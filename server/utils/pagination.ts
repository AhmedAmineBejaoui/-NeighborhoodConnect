import { Request } from 'express';

export interface PaginationParams {
  cursor?: Date;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export function buildCursorQuery(field: string = 'createdAt', cursor?: string) {
  if (!cursor) return {};
  
  try {
    const cursorDate = new Date(cursor);
    return { [field]: { $lt: cursorDate } };
  } catch {
    return {};
  }
}

export function getPaginationParams(req: Request): PaginationParams {
  const cursor = req.query.cursor as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  
  return {
    cursor: cursor ? new Date(cursor) : undefined,
    limit,
  };
}

export function buildPaginatedResponse<T extends { createdAt: Date }>(
  items: T[],
  limit: number
): PaginatedResponse<T> {
  const hasMore = items.length === limit;
  const actualItems = hasMore ? items.slice(0, -1) : items;
  
  return {
    items: actualItems,
    nextCursor: actualItems.length > 0 ? actualItems[actualItems.length - 1].createdAt.toISOString() : undefined,
    hasMore,
  };
}
