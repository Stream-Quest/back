import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RuleService } from '../rule.service';
import { RuleRepository } from '../rule.repository';
import { TriggerType } from '../../generated/prisma/enums';
import { createMockRuleRepository } from './mocks/rule.repository.mock';
import { createMockRule } from './fixtures/event.fixture';

describe('RuleService', () => {
  let service: RuleService;
  let repository: RuleRepository;

  const mockRule = createMockRule();
  const mockRepository = createMockRuleRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleService,
        { provide: RuleRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(RuleService);
    repository = module.get(RuleRepository);

    jest.clearAllMocks();
  });

  describe('getRule', () => {
    it('should return a rule when found', async () => {
      jest.spyOn(repository, 'getRule').mockResolvedValue(mockRule);

      const result = await service.getRule('rule-123');

      expect(result).toBeDefined();
      expect(repository.getRule).toHaveBeenCalledWith({ id: 'rule-123' });
    });

    it('should throw NotFoundException when rule not found', async () => {
      jest.spyOn(repository, 'getRule').mockResolvedValue(null);

      await expect(service.getRule('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getRule('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('createRule', () => {
    it('should create and return a rule', async () => {
      jest.spyOn(repository, 'createRule').mockResolvedValue(mockRule);

      const dto = {
        triggerType: TriggerType.CHAT_COMMAND,
        config: { command: '!wolf', cooldownPerUser: 60 },
        cooldown: 300,
        isActive: true,
      };

      const result = await service.createRule(dto, 'event-123');

      expect(result).toBeDefined();
      expect(repository.createRule).toHaveBeenCalledWith(dto, 'event-123');
    });
  });

  describe('updateRule', () => {
    it('should update and return a rule', async () => {
      const updatedRule = createMockRule({ cooldown: 600 });
      jest.spyOn(repository, 'updateRule').mockResolvedValue(updatedRule);

      const result = await service.updateRule({ cooldown: 600 }, mockRule);

      expect(result).toBeDefined();
      expect(repository.updateRule).toHaveBeenCalledWith(
        { id: 'rule-123' },
        { cooldown: 600 },
      );
    });
  });

  describe('deleteRule', () => {
    it('should delete and return a rule', async () => {
      jest.spyOn(repository, 'deleteRule').mockResolvedValue(mockRule);

      const result = await service.deleteRule(mockRule);

      expect(result).toEqual(mockRule);
      expect(repository.deleteRule).toHaveBeenCalledWith({ id: 'rule-123' });
    });
  });
});
