import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResolutionService } from '../resolution.service';
import { ResolutionRepository } from '../resolution.repository';
import { Operator, ContextType } from '../../generated/prisma/enums';
import {
  createMockResolution,
  createMockResolutionWithConditions,
} from './fixtures/event.fixture';
import { createMockResolutionRepository } from './mocks/resolution.repository.mock';

describe('ResolutionService', () => {
  let service: ResolutionService;
  let repository: ResolutionRepository;

  const mockResolution = createMockResolution();
  const mockResolutionWithConditions = createMockResolutionWithConditions();
  const mockRepository = createMockResolutionRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolutionService,
        { provide: ResolutionRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(ResolutionService);
    repository = module.get(ResolutionRepository);

    jest.clearAllMocks();
  });

  describe('getResolution', () => {
    it('should return a resolution when found', async () => {
      jest
        .spyOn(repository, 'getResolution')
        .mockResolvedValue(mockResolutionWithConditions);

      const result = await service.getResolution('resolution-123');

      expect(result).toBeDefined();
      expect(repository.getResolution).toHaveBeenCalledWith({
        id: 'resolution-123',
      });
    });

    it('should throw NotFoundException when resolution not found', async () => {
      jest.spyOn(repository, 'getResolution').mockResolvedValue(null);

      await expect(service.getResolution('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getResolution('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createResolution', () => {
    it('should create and return a resolution with conditions', async () => {
      jest
        .spyOn(repository, 'createResolution')
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

      const result = await service.createResolution(dto, 'event-123');

      expect(result).toBeDefined();
      expect(repository.createResolution).toHaveBeenCalledWith(
        dto,
        'event-123',
      );
    });
  });

  describe('updateResolution', () => {
    it('should update and return a resolution', async () => {
      const updatedResolution = createMockResolutionWithConditions({
        message: 'Updated message',
      });
      jest
        .spyOn(repository, 'updateResolution')
        .mockResolvedValue(updatedResolution);

      const result = await service.updateResolution(
        { message: 'Updated message' },
        mockResolution,
      );

      expect(result).toBeDefined();
      expect(repository.updateResolution).toHaveBeenCalledWith(
        { id: 'resolution-123' },
        { message: 'Updated message' },
      );
    });
  });

  describe('deleteResolution', () => {
    it('should delete and return a resolution', async () => {
      jest
        .spyOn(repository, 'deleteResolution')
        .mockResolvedValue(mockResolution);

      const result = await service.deleteResolution(mockResolution);

      expect(result).toEqual(mockResolution);
      expect(repository.deleteResolution).toHaveBeenCalledWith({
        id: 'resolution-123',
      });
    });
  });
});
