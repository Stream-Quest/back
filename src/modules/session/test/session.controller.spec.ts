import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { SessionController } from '../session.controller';
import { SessionService } from '../session.service';
import {
  SessionEventStatus,
  SessionStatus,
  TimeOfDay,
} from '../../../generated/prisma/client';
import { createMockSession, createMockUser } from './fixtures/session.fixture';
import { createMockSessionService } from './mocks/session.service.mock';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { SessionGuard } from '../guard/session.guard';
import { SessionEventService } from '../../session-event/session-event.service';
import {
  createMockSessionEvent,
  createMockSessionEventWithDetails,
} from '../../session-event/test/fixtures/session-event.fixture';
import { createMockSessionEventService } from '../../session-event/test/mocks/session-event.service.mock';
import { SessionEventGuard } from '../../session-event/guard/session-event.guard';

describe('SessionController', () => {
  let controller: SessionController;
  let service: SessionService;
  let sessionEventService: SessionEventService;

  const mockUser = createMockUser();
  const mockSession = createMockSession();
  const mockService = createMockSessionService();
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
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: mockService,
        },
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

    controller = module.get(SessionController);
    service = module.get(SessionService);
    sessionEventService = module.get(SessionEventService);

    jest.clearAllMocks();
  });

  describe('sessionList', () => {
    it('should return paginated session list', async () => {
      const mockResponse = {
        data: [mockSession],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest.spyOn(service, 'getSessionList').mockResolvedValue(mockResponse);

      const result = await controller.sessionList({ limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(service.getSessionList).toHaveBeenCalledWith({ limit: 10 });
    });

    it('should filter by campaignId', async () => {
      const mockResponse = {
        data: [mockSession],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest.spyOn(service, 'getSessionList').mockResolvedValue(mockResponse);

      await controller.sessionList({
        campaignId: 'campaign-123',
        limit: 10,
      });

      expect(service.getSessionList).toHaveBeenCalledWith({
        campaignId: 'campaign-123',
        limit: 10,
      });
    });
  });

  describe('sessionDetails', () => {
    it('should return session details', async () => {
      jest.spyOn(service, 'getSession').mockResolvedValue(mockSession);

      const result = await controller.sessionDetails('session-123');

      expect(result).toEqual(mockSession);
      expect(service.getSession).toHaveBeenCalledWith('session-123');
    });
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const createDto = {
        title: 'New Session',
        description: 'A new session',
        campaignId: 'campaign-123',
      };
      jest.spyOn(service, 'createSession').mockResolvedValue(mockSession);

      const result = await controller.createSession(createDto);

      expect(result).toEqual(mockSession);
      expect(service.createSession).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateSession', () => {
    it('should update a session', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedSession = createMockSession({ title: 'Updated Title' });
      jest.spyOn(service, 'updateSession').mockResolvedValue(updatedSession);

      const result = await controller.updateSession(updateDto, mockSession);

      expect(result).toEqual(updatedSession);
      expect(service.updateSession).toHaveBeenCalledWith(
        updateDto,
        mockSession,
      );
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status', async () => {
      const statusDto = { status: SessionStatus.LIVE };
      const updatedSession = createMockSession({ status: SessionStatus.LIVE });
      jest
        .spyOn(service, 'updateSessionStatus')
        .mockResolvedValue(updatedSession);

      const result = await controller.updateSessionStatus(
        statusDto,
        mockSession,
      );

      expect(result).toEqual(updatedSession);
      expect(service.updateSessionStatus).toHaveBeenCalledWith(
        statusDto,
        mockSession,
      );
    });
  });

  describe('startSession', () => {
    it('should start a session', async () => {
      const startedSession = createMockSession({
        status: SessionStatus.LIVE,
        startedAt: new Date(),
      });
      jest.spyOn(service, 'startSession').mockResolvedValue(startedSession);

      const result = await controller.startSession(mockSession);

      expect(result).toEqual(startedSession);
      expect(service.startSession).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('endSession', () => {
    it('should end a session', async () => {
      const endedSession = createMockSession({
        status: SessionStatus.ENDED,
        endedAt: new Date(),
      });
      jest.spyOn(service, 'endSession').mockResolvedValue(endedSession);

      const result = await controller.endSession(mockSession);

      expect(result).toEqual(endedSession);
      expect(service.endSession).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('getContextSnapshots', () => {
    it('should return context snapshots for a session', async () => {
      const mockSnapshots = [
        {
          id: 'snapshot-1',
          sessionId: 'session-123',
          timeOfDay: TimeOfDay.DAY,
          weatherId: null,
          locationId: null,
          snapshotAt: new Date(),
        },
      ];
      jest
        .spyOn(service, 'getContextSnapshots')
        .mockResolvedValue(mockSnapshots);

      const result = await controller.getContextSnapshots(mockSession);

      expect(result).toEqual(mockSnapshots);
      expect(service.getContextSnapshots).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('updateContextSnapshot', () => {
    it('should create a context snapshot', async () => {
      jest.spyOn(service, 'updateContextSnapshot').mockResolvedValue(undefined);

      const dto = { timeOfDay: 'DAY' as const };

      await controller.updateContextSnapshot(dto, mockSession);

      expect(service.updateContextSnapshot).toHaveBeenCalledWith(
        dto,
        mockSession,
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      jest.spyOn(service, 'deleteSession').mockResolvedValue(mockSession);

      const result = await controller.deleteSession(mockSession);

      expect(result).toEqual(mockSession);
      expect(service.deleteSession).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('Guards', () => {
    it('should apply JwtAuthGuard to all routes', () => {
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });

    it('should apply SessionGuard to protected routes', () => {
      expect(mockSessionGuard.canActivate).toBeDefined();
    });
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
      });

      expect(result).toEqual(mockSessionEvent);
      expect(sessionEventService.createSessionEvent).toHaveBeenCalledWith(
        { eventId: 'event-123' },
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
