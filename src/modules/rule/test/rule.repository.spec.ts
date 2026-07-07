import { Test, TestingModule } from '@nestjs/testing';
import { RuleRepository } from '../rule.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { TriggerType } from '../../../generated/prisma/enums';
import { createMockRule } from '../../event/test/fixtures/event.fixture';
import { createMockPrismaService } from '../../event/test/mocks/event.prisma.mock';

describe('RuleRepository', () => {
  let repository: RuleRepository;
  let prismaService: PrismaService;

  const mockRule = createMockRule();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(RuleRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getRule', () => {
    it('should return a rule when found', async () => {
      jest.spyOn(prismaService.rule, 'findUnique').mockResolvedValue(mockRule);

      const result = await repository.getRule({ id: 'rule-123' });

      expect(result).toEqual(mockRule);
      expect(prismaService.rule.findUnique).toHaveBeenCalledWith({
        where: { id: 'rule-123' },
      });
    });

    it('should return null when rule not found', async () => {
      jest.spyOn(prismaService.rule, 'findUnique').mockResolvedValue(null);

      const result = await repository.getRule({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('createRule', () => {
    it('should create and return a rule', async () => {
      jest.spyOn(prismaService.rule, 'create').mockResolvedValue(mockRule);

      const dto = {
        triggerType: TriggerType.CHAT_COMMAND,
        config: { command: '!wolf', cooldownPerUser: 60 },
        cooldown: 300,
        isActive: true,
      };

      const result = await repository.createRule(dto, 'event-123');

      expect(result).toEqual(mockRule);
      expect(prismaService.rule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            event: { connect: { id: 'event-123' } },
          }),
        }),
      );
    });
  });

  describe('updateRule', () => {
    it('should update and return a rule', async () => {
      const updatedRule = createMockRule({ cooldown: 600 });
      jest.spyOn(prismaService.rule, 'update').mockResolvedValue(updatedRule);

      const result = await repository.updateRule(
        { id: 'rule-123' },
        { cooldown: 600 },
      );

      expect(result).toEqual(updatedRule);
      expect(prismaService.rule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rule-123' },
          data: expect.objectContaining({ cooldown: 600 }),
        }),
      );
    });

    it('should cast config to InputJsonValue when provided', async () => {
      jest.spyOn(prismaService.rule, 'update').mockResolvedValue(mockRule);

      await repository.updateRule(
        { id: 'rule-123' },
        { config: { command: '!newwolf' } },
      );

      const callArg = (prismaService.rule.update as jest.Mock).mock.calls[0][0];
      expect(callArg.data.config).toBeDefined();
    });

    it('should not include config in data when not provided', async () => {
      jest.spyOn(prismaService.rule, 'update').mockResolvedValue(mockRule);

      await repository.updateRule({ id: 'rule-123' }, { cooldown: 600 });

      const callArg = (prismaService.rule.update as jest.Mock).mock.calls[0][0];
      expect(callArg.data.config).toBeUndefined();
    });
  });

  describe('deleteRule', () => {
    it('should delete and return a rule', async () => {
      jest.spyOn(prismaService.rule, 'delete').mockResolvedValue(mockRule);

      const result = await repository.deleteRule({ id: 'rule-123' });

      expect(result).toEqual(mockRule);
      expect(prismaService.rule.delete).toHaveBeenCalledWith({
        where: { id: 'rule-123' },
      });
    });
  });
});
