import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { createMockCampaign } from '../../test/fixtures/campaign.fixture';
import { CampaignGuard } from '../../guard/campaign.guard';

describe('CampaignGuard', () => {
  let guard: CampaignGuard;
  let prismaService: { campaign: { findUnique: jest.Mock } };

  const mockCampaign = createMockCampaign({ gameMasterId: 'user-123' });

  const createMockContext = (
    userId: string | undefined,
    campaignId: string | undefined,
  ): ExecutionContext => {
    const request = {
      user: userId ? { sub: userId } : undefined,
      params: { id: campaignId },
      campaign: undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    prismaService = {
      campaign: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignGuard,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    guard = module.get(CampaignGuard);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockContext(undefined, 'campaign-123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('User not authenticated'),
      );
      expect(prismaService.campaign.findUnique).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when campaign id is not provided', async () => {
      const context = createMockContext('user-123', undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new BadRequestException('Campaign id not provided'),
      );
      expect(prismaService.campaign.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(null);
      const context = createMockContext('user-123', 'campaign-123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new NotFoundException('Campaign not found'),
      );
    });

    it('should throw ForbiddenException when user is not the game master', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(mockCampaign);
      const context = createMockContext('other-user', 'campaign-123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'You do not have permission to access this campaign',
        ),
      );
    });

    it('should allow access and attach campaign when user is the game master', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(mockCampaign);
      const context = createMockContext('user-123', 'campaign-123');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      const request = context.switchToHttp().getRequest();
      expect(request.campaign).toEqual(mockCampaign);
      expect(prismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaign-123' },
      });
    });
  });
});
