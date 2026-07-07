import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { EventController } from '../event.controller';
import { EventService } from '../event.service';
import { RuleService } from '../../rule/rule.service';
import { ResolutionService } from '../../resolution/resolution.service';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { EventGuard } from '../guard/event.guard';
import { RuleGuard } from '../../rule/guard/rule.guard';
import { ResolutionGuard } from '../../resolution/guard/resolution.guard';
import { TriggerType } from '../../../generated/prisma/enums';
import {
  createMockEvent,
  createMockEventWithCount,
  createMockEventWithDetails,
  createMockResolution,
  createMockResolutionWithConditions,
  createMockRule,
} from './fixtures/event.fixture';
import { createMockEventService } from './mocks/event.service.mock';
import { createMockRuleService } from '../../rule/test/mocks/rule.service.mock';
import { createMockResolutionService } from '../../resolution/test/mocks/resolution.service.mock';

describe('EventController', () => {
  let controller: EventController;
  let eventService: EventService;
  let ruleService: RuleService;
  let resolutionService: ResolutionService;

  const mockEvent = createMockEvent();
  const mockEventWithCount = createMockEventWithCount();
  const mockEventWithDetails = createMockEventWithDetails();
  const mockRule = createMockRule();
  const mockResolution = createMockResolution();
  const mockResolutionWithConditions = createMockResolutionWithConditions();
  const mockUser = {
    sub: 'user-123',
    username: 'testuser',
    type: 'gm' as const,
  };

  const mockEventService = createMockEventService();
  const mockRuleService = createMockRuleService();
  const mockResolutionService = createMockResolutionService();

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser;
      return true;
    }),
  };

  const mockEventGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.event = mockEvent;
      return true;
    }),
  };

  const mockRuleGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.rule = mockRule;
      return true;
    }),
  };

  const mockResolutionGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.resolution = mockResolution;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: mockEventService },
        { provide: RuleService, useValue: mockRuleService },
        { provide: ResolutionService, useValue: mockResolutionService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(EventGuard)
      .useValue(mockEventGuard)
      .overrideGuard(RuleGuard)
      .useValue(mockRuleGuard)
      .overrideGuard(ResolutionGuard)
      .useValue(mockResolutionGuard)
      .compile();

    controller = module.get(EventController);
    eventService = module.get(EventService);
    ruleService = module.get(RuleService);
    resolutionService = module.get(ResolutionService);

    jest.clearAllMocks();
  });

  // ─── Event routes ──────────────────────────────────────────────────────────

  describe('eventList', () => {
    it('should return paginated event list', async () => {
      const mockResponse = {
        data: [mockEventWithCount],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest.spyOn(eventService, 'getEventList').mockResolvedValue(mockResponse);

      const result = await controller.eventList({ limit: 10 }, mockUser);

      expect(result).toEqual(mockResponse);
      expect(eventService.getEventList).toHaveBeenCalledWith(
        { limit: 10 },
        mockUser,
      );
    });
  });

  describe('eventDetails', () => {
    it('should return detailed event', async () => {
      jest
        .spyOn(eventService, 'getEvent')
        .mockResolvedValue(mockEventWithDetails);

      const result = await controller.eventDetails('event-123');

      expect(result).toEqual(mockEventWithDetails);
      expect(eventService.getEvent).toHaveBeenCalledWith('event-123');
    });
  });

  describe('createEvent', () => {
    it('should create and return an event', async () => {
      const createDto = {
        name: 'Wolf ambush',
        karmaValue: -10,
        isTemplate: false,
        isPublic: false,
        eventTypeId: 'event-type-123',
      };
      jest
        .spyOn(eventService, 'createEvent')
        .mockResolvedValue(mockEventWithCount);

      const result = await controller.createEvent(createDto, mockUser);

      expect(result).toEqual(mockEventWithCount);
      expect(eventService.createEvent).toHaveBeenCalledWith(
        createDto,
        mockUser,
      );
    });
  });

  describe('updateEvent', () => {
    it('should update and return an event', async () => {
      const updatedEvent = createMockEventWithCount({ name: 'Updated' });
      jest.spyOn(eventService, 'updateEvent').mockResolvedValue(updatedEvent);

      const result = await controller.updateEvent(
        { name: 'Updated' },
        mockEvent,
      );

      expect(result).toEqual(updatedEvent);
      expect(eventService.updateEvent).toHaveBeenCalledWith(
        { name: 'Updated' },
        mockEvent,
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete and return an event', async () => {
      jest.spyOn(eventService, 'deleteEvent').mockResolvedValue(mockEvent);

      const result = await controller.deleteEvent(mockEvent);

      expect(result).toEqual(mockEvent);
      expect(eventService.deleteEvent).toHaveBeenCalledWith(mockEvent);
    });
  });

  // ─── Rule routes ───────────────────────────────────────────────────────────

  describe('getRule', () => {
    it('should return rule from context', () => {
      const result = controller.getRule(mockRule);

      expect(result).toBeDefined();
    });
  });

  describe('createRule', () => {
    it('should create and return a rule', async () => {
      const createDto = {
        triggerType: TriggerType.CHAT_COMMAND,
        config: { command: '!wolf' },
        cooldown: 300,
        isActive: true,
      };
      jest.spyOn(ruleService, 'createRule').mockResolvedValue(mockRule);

      const result = await controller.createRule('event-123', createDto);

      expect(result).toBeDefined();
      expect(ruleService.createRule).toHaveBeenCalledWith(
        createDto,
        'event-123',
      );
    });
  });

  describe('updateRule', () => {
    it('should update and return a rule', async () => {
      const updatedRule = createMockRule({ cooldown: 600 });
      jest.spyOn(ruleService, 'updateRule').mockResolvedValue(updatedRule);

      const result = await controller.updateRule({ cooldown: 600 }, mockRule);

      expect(result).toBeDefined();
      expect(ruleService.updateRule).toHaveBeenCalledWith(
        { cooldown: 600 },
        mockRule,
      );
    });
  });

  describe('deleteRule', () => {
    it('should delete and return a rule', async () => {
      jest.spyOn(ruleService, 'deleteRule').mockResolvedValue(mockRule);

      const result = await controller.deleteRule(mockRule);

      expect(result).toEqual(mockRule);
      expect(ruleService.deleteRule).toHaveBeenCalledWith(mockRule);
    });
  });

  // ─── Resolution routes ─────────────────────────────────────────────────────

  describe('getResolution', () => {
    it('should return resolution with conditions', async () => {
      jest
        .spyOn(resolutionService, 'getResolution')
        .mockResolvedValue(mockResolutionWithConditions);

      const result = await controller.getResolution(mockResolution);

      expect(result).toBeDefined();
      expect(resolutionService.getResolution).toHaveBeenCalledWith(
        mockResolution.id,
      );
    });
  });

  describe('createResolution', () => {
    it('should create and return a resolution', async () => {
      const createDto = {
        message: 'The wolves emerge...',
        isFallback: false,
      };
      jest
        .spyOn(resolutionService, 'createResolution')
        .mockResolvedValue(mockResolutionWithConditions);

      const result = await controller.createResolution('event-123', createDto);

      expect(result).toBeDefined();
      expect(resolutionService.createResolution).toHaveBeenCalledWith(
        createDto,
        'event-123',
      );
    });
  });

  describe('updateResolution', () => {
    it('should update and return a resolution', async () => {
      const updatedResolution = createMockResolutionWithConditions({
        message: 'Updated',
      });
      jest
        .spyOn(resolutionService, 'updateResolution')
        .mockResolvedValue(updatedResolution);

      const result = await controller.updateResolution(
        { message: 'Updated' },
        mockResolution,
      );

      expect(result).toBeDefined();
      expect(resolutionService.updateResolution).toHaveBeenCalledWith(
        { message: 'Updated' },
        mockResolution,
      );
    });
  });

  describe('deleteResolution', () => {
    it('should delete and return a resolution', async () => {
      jest
        .spyOn(resolutionService, 'deleteResolution')
        .mockResolvedValue(mockResolution);

      const result = await controller.deleteResolution(mockResolution);

      expect(result).toEqual(mockResolution);
      expect(resolutionService.deleteResolution).toHaveBeenCalledWith(
        mockResolution,
      );
    });
  });
});
