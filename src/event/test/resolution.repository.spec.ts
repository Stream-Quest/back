import { Test, TestingModule } from '@nestjs/testing';
import { ResolutionRepository } from '../resolution.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Operator, ContextType } from '../../generated/prisma/enums';
import {
  createMockResolution,
  createMockResolutionWithConditions,
} from './fixtures/event.fixture';
import { createMockPrismaService } from './mocks/event.prisma.mock';

describe('ResolutionRepository', () => {
  let repository: ResolutionRepository;
  let prismaService: PrismaService;

  const mockResolution = createMockResolution();
  const mockResolutionWithConditions = createMockResolutionWithConditions();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolutionRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(ResolutionRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getResolution', () => {
    it('should return resolution with conditions when found', async () => {
      jest
        .spyOn(prismaService.resolution, 'findUnique')
        .mockResolvedValue(mockResolutionWithConditions);

      const result = await repository.getResolution({ id: 'resolution-123' });

      expect(result).toEqual(mockResolutionWithConditions);
      expect(prismaService.resolution.findUnique).toHaveBeenCalledWith({
        where: { id: 'resolution-123' },
        include: expect.objectContaining({
          conditionGroups: expect.any(Object),
        }),
      });
    });

    it('should return null when resolution not found', async () => {
      jest
        .spyOn(prismaService.resolution, 'findUnique')
        .mockResolvedValue(null);

      const result = await repository.getResolution({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('createResolution', () => {
    it('should create and return resolution with conditions', async () => {
      jest
        .spyOn(prismaService.resolution, 'create')
        .mockResolvedValue(mockResolutionWithConditions);

      const dto = {
        message: 'The wolves emerge from the shadows...',
        isFallback: false,
        conditionGroups: [
          {
            operator: Operator.AND,
            conditions: [
              { contextType: ContextType.TIME_OF_DAY, value: 'NIGHT' },
            ],
          },
        ],
      };

      const result = await repository.createResolution(dto, 'event-123');

      expect(result).toEqual(mockResolutionWithConditions);
      expect(prismaService.resolution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            event: { connect: { id: 'event-123' } },
            conditionGroups: expect.any(Object),
          }),
        }),
      );
    });

    it('should create resolution without conditionGroups', async () => {
      jest
        .spyOn(prismaService.resolution, 'create')
        .mockResolvedValue(mockResolutionWithConditions);

      await repository.createResolution(
        { message: 'Fallback', isFallback: true },
        'event-123',
      );

      const callArg = (prismaService.resolution.create as jest.Mock).mock
        .calls[0][0];
      expect(callArg.data.conditionGroups.create).toBeUndefined();
    });
  });

  describe('updateResolution', () => {
    it('should delete existing conditions and update resolution', async () => {
      const updatedResolution = createMockResolutionWithConditions({
        message: 'Updated message',
      });

      mockPrismaService.$transaction.mockImplementation(
        async (fn: (tx: typeof mockPrismaService) => Promise<unknown>) =>
          fn(mockPrismaService),
      );

      mockPrismaService.conditionGroup.deleteMany.mockResolvedValue({
        count: 1,
      });

      mockPrismaService.resolution.update.mockResolvedValue(updatedResolution);

      const result = await repository.updateResolution(
        { id: 'resolution-123' },
        { message: 'Updated message' },
      );

      expect(result).toEqual(updatedResolution);
      expect(mockPrismaService.conditionGroup.deleteMany).toHaveBeenCalledWith({
        where: { resolutionId: 'resolution-123' },
      });
    });
  });

  describe('deleteResolution', () => {
    it('should delete and return resolution', async () => {
      jest
        .spyOn(prismaService.resolution, 'delete')
        .mockResolvedValue(mockResolution);

      const result = await repository.deleteResolution({
        id: 'resolution-123',
      });

      expect(result).toEqual(mockResolution);
      expect(prismaService.resolution.delete).toHaveBeenCalledWith({
        where: { id: 'resolution-123' },
      });
    });
  });
});
