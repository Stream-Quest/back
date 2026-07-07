import { Test, TestingModule } from '@nestjs/testing';
import { WeatherRepository } from '../weather.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockWeather } from './fixtures/weather.fixture';
import { createMockPrismaService } from './mocks/weather.prisma.mock';

describe('WeatherRepository', () => {
  let repository: WeatherRepository;
  let prismaService: PrismaService;

  const mockWeather = createMockWeather();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(WeatherRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getWeather', () => {
    it('should return a weather when found', async () => {
      jest
        .spyOn(prismaService.weather, 'findUnique')
        .mockResolvedValue(mockWeather);

      const result = await repository.getWeather({ id: 'weather-123' });

      expect(result).toEqual(mockWeather);
      expect(prismaService.weather.findUnique).toHaveBeenCalledWith({
        where: { id: 'weather-123' },
      });
    });

    it('should return null when weather not found', async () => {
      jest.spyOn(prismaService.weather, 'findUnique').mockResolvedValue(null);

      const result = await repository.getWeather({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('getWeatherList', () => {
    const mockWeathers = [
      createMockWeather({ id: 'weather-1', name: 'SUNNY' }),
      createMockWeather({ id: 'weather-2', name: 'RAINY' }),
    ];

    it('should return weathers in forward direction', async () => {
      jest
        .spyOn(prismaService.weather, 'findMany')
        .mockResolvedValue(mockWeathers);

      const result = await repository.getWeatherList({
        take: 10,
        direction: 'forward',
      });

      expect(result).toEqual(mockWeathers);
      expect(prismaService.weather.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return weathers in backward direction (reversed)', async () => {
      jest
        .spyOn(prismaService.weather, 'findMany')
        .mockResolvedValue([...mockWeathers]);

      const result = await repository.getWeatherList({
        take: 10,
        direction: 'backward',
        cursor: 'cursor-123',
      });

      expect(result).toEqual([...mockWeathers].reverse());
      expect(prismaService.weather.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: -10,
          skip: 1,
          cursor: { id: 'cursor-123' },
        }),
      );
    });

    it('should use default take value of 10', async () => {
      jest
        .spyOn(prismaService.weather, 'findMany')
        .mockResolvedValue(mockWeathers);

      await repository.getWeatherList();

      expect(prismaService.weather.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('createWeather', () => {
    it('should create and return a weather with name uppercased', async () => {
      jest
        .spyOn(prismaService.weather, 'create')
        .mockResolvedValue(mockWeather);

      const dto = {
        name: 'sunny',
        displayName: 'Sunny',
        description: 'A sunny day',
        iconUrl: 'https://example.com/sunny.png',
      };

      const result = await repository.createWeather(dto);

      expect(result).toEqual(mockWeather);
      expect(prismaService.weather.create).toHaveBeenCalledWith({
        data: {
          name: 'SUNNY',
          displayName: 'Sunny',
          description: 'A sunny day',
          iconUrl: 'https://example.com/sunny.png',
        },
      });
    });

    it('should uppercase the name regardless of input casing', async () => {
      jest
        .spyOn(prismaService.weather, 'create')
        .mockResolvedValue(mockWeather);

      await repository.createWeather({
        name: 'Partly Cloudy',
        displayName: 'Partly Cloudy',
      });

      expect(prismaService.weather.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'PARTLY CLOUDY' }),
        }),
      );
    });
  });

  describe('updateWeather', () => {
    it('should update and return a weather', async () => {
      const updatedWeather = createMockWeather({ displayName: 'Very Sunny' });
      jest
        .spyOn(prismaService.weather, 'update')
        .mockResolvedValue(updatedWeather);

      const result = await repository.updateWeather(
        { id: 'weather-123' },
        { displayName: 'Very Sunny' },
      );

      expect(result).toEqual(updatedWeather);
      expect(prismaService.weather.update).toHaveBeenCalledWith({
        where: { id: 'weather-123' },
        data: { displayName: 'Very Sunny' },
      });
    });
  });

  describe('deleteWeather', () => {
    it('should delete and return a weather', async () => {
      jest
        .spyOn(prismaService.weather, 'delete')
        .mockResolvedValue(mockWeather);

      const result = await repository.deleteWeather({ id: 'weather-123' });

      expect(result).toEqual(mockWeather);
      expect(prismaService.weather.delete).toHaveBeenCalledWith({
        where: { id: 'weather-123' },
      });
    });
  });
});
