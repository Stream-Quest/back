import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RuleGuard } from '../guard/rule.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockRule } from './fixtures/event.fixture';

const createMockPrismaService = () => ({
  rule: { findUnique: jest.fn() },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    eventId?: string;
    ruleId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: {
      id: overrides.eventId ?? 'event-123',
      ruleId: overrides.ruleId ?? 'rule-123',
    },
    rule: undefined,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

describe('RuleGuard', () => {
  let guard: RuleGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockRule = createMockRule();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleGuard,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    guard = module.get(RuleGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when rule exists and belongs to event', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'event-123',
        ruleId: 'rule-123',
      });
      jest.spyOn(prismaService.rule, 'findUnique').mockResolvedValue(mockRule);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach rule to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'event-123',
        ruleId: 'rule-123',
      });
      const request = context.switchToHttp().getRequest();
      jest.spyOn(prismaService.rule, 'findUnique').mockResolvedValue(mockRule);

      await guard.canActivate(context);

      expect(request.rule).toEqual(mockRule);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        ruleId: 'rule-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when rule id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        ruleId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Rule id not provided',
      );
    });

    it('should throw NotFoundException when rule not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        ruleId: 'not-found',
      });
      jest.spyOn(prismaService.rule, 'findUnique').mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Rule not found',
      );
    });

    it('should throw ForbiddenException when rule does not belong to event', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'other-event',
        ruleId: 'rule-123',
      });
      jest.spyOn(prismaService.rule, 'findUnique').mockResolvedValue(mockRule);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should query rule with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'event-123',
        ruleId: 'rule-123',
      });
      jest.spyOn(prismaService.rule, 'findUnique').mockResolvedValue(mockRule);

      await guard.canActivate(context);

      expect(prismaService.rule.findUnique).toHaveBeenCalledWith({
        where: { id: 'rule-123' },
      });
    });
  });
});
