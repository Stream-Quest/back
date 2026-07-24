import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { SessionEventController } from '../session-event.controller';
import { SessionEventService } from '../session-event.service';
import {
  SessionEventOrigin,
  SessionEventStatus,
} from '../../../generated/prisma/client';
import {
  createMockSession,
  createMockUser,
} from '../../session/test/fixtures/session.fixture';
import {
  createMockSessionEvent,
  createMockSessionEventWithDetails,
} from './fixtures/session-event.fixture';
import { createMockSessionEventService } from './mocks/session-event.service.mock';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { SessionEventGuard } from '../guard/session-event.guard';
import { SessionGuard } from '../../session/guard/session.guard';

describe('SessionEventController', () => {
  let controller: SessionEventController;
  let sessionEventService: SessionEventService;

  const mockUser = createMockUser();
  const mockSession = createMockSession();
  const mockSessionEvent = createMockSessionEvent();
  const mockSessionEventService = createMockSessionEventService();

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser;
      return true;
    }),
  };

  const mockSessionGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.session = mockSession;
      return true;
    }),
  };

  const mockSessionEventGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.sessionEvent = mockSessionEvent;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionEventController],
      providers: [
        { provide: SessionEventService, useValue: mockSessionEventService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(SessionGuard)
      .useValue(mockSessionGuard)
      .overrideGuard(SessionEventGuard)
      .useValue(mockSessionEventGuard)
      .compile();

    controller = module.get(SessionEventController);
    sessionEventService = module.get(SessionEventService);

    jest.clearAllMocks();
  });

  describe('getSessionEventList', () => {
    it('should return paginated session event list', async () => {
      const mockResponse = {
        data: [mockSessionEvent],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest
        .spyOn(sessionEventService, 'getSessionEventList')
        .mockResolvedValue(mockResponse);

      const result = await controller.getSessionEventList('session-123', {
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(sessionEventService.getSessionEventList).toHaveBeenCalledWith(
        'session-123',
        { limit: 10 },
      );
    });

    it('should filter by status', async () => {
      const mockResponse = {
        data: [mockSessionEvent],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest
        .spyOn(sessionEventService, 'getSessionEventList')
        .mockResolvedValue(mockResponse);

      await controller.getSessionEventList('session-123', {
        limit: 10,
        status: SessionEventStatus.PENDING,
      });

      expect(sessionEventService.getSessionEventList).toHaveBeenCalledWith(
        'session-123',
        { limit: 10, status: SessionEventStatus.PENDING },
      );
    });
  });

  describe('getSessionEvent', () => {
    it('should return session event details', async () => {
      const mockDetails = createMockSessionEventWithDetails();
      jest
        .spyOn(sessionEventService, 'getSessionEvent')
        .mockResolvedValue(mockDetails);

      const result = await controller.getSessionEvent('session-event-123');

      expect(result).toBeDefined();
      expect(sessionEventService.getSessionEvent).toHaveBeenCalledWith(
        'session-event-123',
      );
    });
  });

  describe('createSessionEvent', () => {
    it('should create and return a session event', async () => {
      jest
        .spyOn(sessionEventService, 'createSessionEvent')
        .mockResolvedValue(mockSessionEvent);

      const result = await controller.createSessionEvent('session-123', {
        eventId: 'event-123',
        origin: SessionEventOrigin.MANUAL,
      });

      expect(result).toEqual(mockSessionEvent);
      expect(sessionEventService.createSessionEvent).toHaveBeenCalledWith(
        { eventId: 'event-123', origin: SessionEventOrigin.MANUAL },
        'session-123',
      );
    });
  });

  describe('updateSessionEvent', () => {
    it('should update and return a session event', async () => {
      const updatedEvent = { ...mockSessionEvent, finalMessage: 'Updated' };
      jest
        .spyOn(sessionEventService, 'updateSessionEvent')
        .mockResolvedValue(updatedEvent);

      const result = await controller.updateSessionEvent(
        { finalMessage: 'Updated' },
        mockSessionEvent,
      );

      expect(result).toBeDefined();
      expect(sessionEventService.updateSessionEvent).toHaveBeenCalledWith(
        { finalMessage: 'Updated' },
        mockSessionEvent,
      );
    });
  });

  describe('validateSessionEvent', () => {
    it('should validate and return a session event', async () => {
      const validatedEvent = {
        ...mockSessionEvent,
        status: SessionEventStatus.VALIDATED,
        chosenResolutionId: 'resolution-123',
      };
      jest
        .spyOn(sessionEventService, 'validateSessionEvent')
        .mockResolvedValue(validatedEvent);

      const result = await controller.validateSessionEvent(
        { chosenResolutionId: 'resolution-123' },
        mockSessionEvent,
      );

      expect(result).toBeDefined();
      expect(sessionEventService.validateSessionEvent).toHaveBeenCalledWith(
        { chosenResolutionId: 'resolution-123' },
        mockSessionEvent,
      );
    });
  });

  describe('rejectSessionEvent', () => {
    it('should reject and return a session event', async () => {
      const rejectedEvent = {
        ...mockSessionEvent,
        status: SessionEventStatus.REJECTED,
      };
      jest
        .spyOn(sessionEventService, 'rejectSessionEvent')
        .mockResolvedValue(rejectedEvent);

      const result = await controller.rejectSessionEvent(mockSessionEvent);

      expect(result).toBeDefined();
      expect(sessionEventService.rejectSessionEvent).toHaveBeenCalledWith(
        mockSessionEvent,
      );
    });
  });

  describe('deleteSessionEvent', () => {
    it('should delete and return a session event', async () => {
      jest
        .spyOn(sessionEventService, 'deleteSessionEvent')
        .mockResolvedValue(mockSessionEvent);

      const result = await controller.deleteSessionEvent(mockSessionEvent);

      expect(result).toEqual(mockSessionEvent);
      expect(sessionEventService.deleteSessionEvent).toHaveBeenCalledWith(
        mockSessionEvent,
      );
    });
  });
});
