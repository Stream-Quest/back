import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockCampaignEvent } from './fixtures/campaign-event.fixture';
import { CampaignEventGuard } from '../guard/campaign-event.guard';

const createMockPrismaService = () => ({
  campaignEvent: { findUnique: jest.fn() },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    campaignId?: string;
    campaignEventId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: {
      id: overrides.campaignId ?? 'campaign-123',
      campaignEventId: overrides.campaignEventId ?? 'campaign-event-123',
    },
    campaignEvent: undefined,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

describe('CampaignEventGuard', () => {
  let guard: CampaignEventGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockCampaignEvent = createMockCampaignEvent();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignEventGuard,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    guard = module.get(CampaignEventGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when campaign event exists and belongs to campaign', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        campaignId: 'campaign-123',
        campaignEventId: 'campaign-event-123',
      });
      jest
        .spyOn(prismaService.campaignEvent, 'findUnique')
        .mockResolvedValue(mockCampaignEvent);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach campaign event to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        campaignId: 'campaign-123',
        campaignEventId: 'campaign-event-123',
      });
      const request = context.switchToHttp().getRequest();
      jest
        .spyOn(prismaService.campaignEvent, 'findUnique')
        .mockResolvedValue(mockCampaignEvent);

      await guard.canActivate(context);

      expect(request.campaignEvent).toEqual(mockCampaignEvent);
    });

    it('should throw ForbiddenException when user not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        campaignEventId: 'campaign-event-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when campaign event id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        campaignEventId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Campaign event id not provided',
      );
    });

    it('should throw NotFoundException when campaign event not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        campaignEventId: 'not-found',
      });
      jest
        .spyOn(prismaService.campaignEvent, 'findUnique')
        .mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Campaign event not found',
      );
    });

    it('should throw ForbiddenException when campaign event does not belong to campaign', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        campaignId: 'other-campaign',
        campaignEventId: 'campaign-event-123',
      });
      jest
        .spyOn(prismaService.campaignEvent, 'findUnique')
        .mockResolvedValue(mockCampaignEvent);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should query campaign event with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        campaignId: 'campaign-123',
        campaignEventId: 'campaign-event-123',
      });
      jest
        .spyOn(prismaService.campaignEvent, 'findUnique')
        .mockResolvedValue(mockCampaignEvent);

      await guard.canActivate(context);

      expect(prismaService.campaignEvent.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaign-event-123' },
      });
    });
  });
});
