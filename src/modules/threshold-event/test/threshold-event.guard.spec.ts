import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ThresholdEventGuard } from '../guard/threshold-event.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockThresholdEvent } from './fixtures/threshold-event.fixture';

describe('ThresholdEventGuard', () => {
  let guard: ThresholdEventGuard;

  const mockThresholdEvent = createMockThresholdEvent();

  const mockPrisma = {
    campaignThresholdEvent: {
      findUnique: jest.fn().mockResolvedValue(mockThresholdEvent),
    },
  };

  const createMockContext = (
    overrides: {
      userId?: string;
      campaignId?: string;
      thresholdEventId?: string;
    } = {},
  ): ExecutionContext => {
    const request = {
      user: { sub: overrides.userId ?? 'user-123' },
      params: {
        id: overrides.campaignId ?? 'campaign-123',
        thresholdEventId: overrides.thresholdEventId ?? 'threshold-event-123',
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
        ThresholdEventGuard,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    guard = module.get(ThresholdEventGuard);
    jest.clearAllMocks();
  });

  it('should return true and set thresholdEvent on request when valid', async () => {
    mockPrisma.campaignThresholdEvent.findUnique.mockResolvedValue(
      mockThresholdEvent,
    );

    const context = createMockContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest().thresholdEvent).toEqual(
      mockThresholdEvent,
    );
  });

  it('should throw ForbiddenException when user not authenticated', async () => {
    const context = createMockContext({ userId: undefined });
    context.switchToHttp().getRequest().user = undefined;

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw BadRequestException when thresholdEventId is missing', async () => {
    const context = createMockContext({ thresholdEventId: '' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when threshold event not found', async () => {
    mockPrisma.campaignThresholdEvent.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(createMockContext())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when threshold event belongs to different campaign', async () => {
    mockPrisma.campaignThresholdEvent.findUnique.mockResolvedValue({
      ...mockThresholdEvent,
      campaignId: 'other-campaign',
    });

    await expect(guard.canActivate(createMockContext())).rejects.toThrow(
      ForbiddenException,
    );
  });
});
