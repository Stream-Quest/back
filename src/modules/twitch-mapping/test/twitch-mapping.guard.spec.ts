import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TwitchMappingGuard } from '../guard/twitch-mapping.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockTwitchMapping } from './fixtures/twitch-mapping.fixture';

describe('TwitchMappingGuard', () => {
  let guard: TwitchMappingGuard;

  const mockTwitchMapping = createMockTwitchMapping();

  const mockPrisma = {
    twitchEventMapping: {
      findUnique: jest.fn().mockResolvedValue(mockTwitchMapping),
    },
  };

  const createMockContext = (
    overrides: {
      userId?: string;
      campaignId?: string;
      mappingId?: string;
    } = {},
  ): ExecutionContext => {
    const request = {
      user: { sub: overrides.userId ?? 'user-123' },
      params: {
        id: overrides.campaignId ?? 'campaign-123',
        mappingId: overrides.mappingId ?? 'twitch-mapping-123',
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitchMappingGuard,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    guard = module.get(TwitchMappingGuard);
    jest.clearAllMocks();
  });

  it('should return true and set twitchMapping on request when valid', async () => {
    mockPrisma.twitchEventMapping.findUnique.mockResolvedValue(
      mockTwitchMapping,
    );

    const context = createMockContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest().twitchMapping).toEqual(
      mockTwitchMapping,
    );
  });

  it('should throw ForbiddenException when user not authenticated', async () => {
    const context = createMockContext();
    context.switchToHttp().getRequest().user = undefined;

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw BadRequestException when mappingId is missing', async () => {
    const context = createMockContext({ mappingId: '' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when mapping not found', async () => {
    mockPrisma.twitchEventMapping.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(createMockContext())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when mapping belongs to different campaign', async () => {
    mockPrisma.twitchEventMapping.findUnique.mockResolvedValue({
      ...mockTwitchMapping,
      campaignId: 'other-campaign',
    });

    await expect(guard.canActivate(createMockContext())).rejects.toThrow(
      ForbiddenException,
    );
  });
});
