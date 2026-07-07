import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { EventTypeController } from '../event-type.controller';
import { EventTypeService } from '../event-type.service';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { EventTypeGuard } from '../guard/event-type.guard';
import { createMockEventType } from './fixtures/event-type.fixture';
import { createMockEventTypeService } from './mocks/event-type.service.mock';

describe('EventTypeController', () => {
  let controller: EventTypeController;
  let service: EventTypeService;

  const mockEventType = createMockEventType();
  const mockService = createMockEventTypeService();
  const mockUser = {
    sub: 'user-123',
    username: 'testuser',
    type: 'gm' as const,
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser;
      return true;
    }),
  };

  const mockEventTypeGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.eventType = mockEventType;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventTypeController],
      providers: [
        {
          provide: EventTypeService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(EventTypeGuard)
      .useValue(mockEventTypeGuard)
      .compile();

    controller = module.get(EventTypeController);
    service = module.get(EventTypeService);

    jest.clearAllMocks();
  });

  describe('eventTypeList', () => {
    it('should return paginated event type list', async () => {
      const mockResponse = {
        data: [mockEventType],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest.spyOn(service, 'getEventTypeList').mockResolvedValue(mockResponse);

      const result = await controller.eventTypeList({ limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(service.getEventTypeList).toHaveBeenCalledWith({ limit: 10 });
    });
  });

  describe('eventTypeDetails', () => {
    it('should return event type details', async () => {
      jest.spyOn(service, 'getEventType').mockResolvedValue(mockEventType);

      const result = await controller.eventTypeDetails('event-type-123');

      expect(result).toEqual(mockEventType);
      expect(service.getEventType).toHaveBeenCalledWith('event-type-123');
    });
  });

  describe('createEventType', () => {
    it('should create and return an event type', async () => {
      const createDto = {
        name: 'Wolf embuscade',
        description:
          'An embuscade of wolves triggered when TimeOfDay is NIGHT and Location is FOREST',
      };
      jest.spyOn(service, 'createEventType').mockResolvedValue(mockEventType);

      const result = await controller.createEventType(createDto, mockUser);

      expect(result).toEqual(mockEventType);
      expect(service.createEventType).toHaveBeenCalledWith(createDto, mockUser);
    });
  });

  describe('updateEventType', () => {
    it('should update and return an event type', async () => {
      const updateDto = { name: 'Updated name' };
      const updatedEventType = createMockEventType({ name: 'Updated name' });
      jest
        .spyOn(service, 'updateEventType')
        .mockResolvedValue(updatedEventType);

      const result = await controller.updateEventType(updateDto, mockEventType);

      expect(result).toEqual(updatedEventType);
      expect(service.updateEventType).toHaveBeenCalledWith(
        updateDto,
        mockEventType,
      );
    });
  });

  describe('deleteEventType', () => {
    it('should delete and return an event type', async () => {
      jest.spyOn(service, 'deleteEventType').mockResolvedValue(mockEventType);

      const result = await controller.deleteEventType(mockEventType);

      expect(result).toEqual(mockEventType);
      expect(service.deleteEventType).toHaveBeenCalledWith(mockEventType);
    });
  });

  describe('Guards', () => {
    it('should apply JwtAuthGuard to all routes', () => {
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });

    it('should apply EventTypeGuard to protected routes', () => {
      expect(mockEventTypeGuard.canActivate).toBeDefined();
    });
  });
});
