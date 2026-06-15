export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  previousCursor: string | null;
  count: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

export interface RepositoryPaginationOptions<
  Where,
  OrderBy,
  Include = unknown,
> {
  where?: Where;
  take?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  orderBy?: OrderBy;
  include?: Include;
}

export function paginate<T extends { id: string }>(
  items: T[],
  options: PaginationOptions,
): PaginatedResult<T> {
  const limit = options.limit || 10;
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;

  return {
    data,
    nextCursor: hasMore ? data[data.length - 1].id : null,
    previousCursor: data.length > 0 ? data[0].id : null,
    count: data.length,
    hasMore,
    hasPrevious: !!options.cursor,
  };
}

export async function paginatedFindMany<T, Args>(
  findMany: (args: Args) => Promise<T[]>,
  options?: RepositoryPaginationOptions<unknown, unknown>,
): Promise<T[]> {
  const isBackward = options?.direction === 'backward';
  const take = options?.take || 10;

  const args = {
    ...(options?.where ? { where: options.where } : {}),
    take: isBackward ? -take : take,
    ...(options?.cursor && {
      skip: 1,
      cursor: { id: options.cursor },
    }),
    orderBy: options?.orderBy || { createdAt: 'desc' },
    ...(options?.include ? { include: options.include } : {}),
  } as unknown as Args;

  const result = await findMany(args);

  return isBackward ? result.reverse() : result;
}
