import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WeatherService } from '../weather.service';
import { WeatherRepository } from '../weather.repository';
import { createMockWeather } from './fixtures/weather.fixture';
import { createMockWeatherRepository } from './mocks/weather.repository.mock';

describe('WeatherService', () => {
  let service: WeatherService;
  let repository: WeatherRepository;

  const mockWeather = createMockWeather();
  const mockRepository = createMockWeatherRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: WeatherRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(WeatherService);
    repository = module.get(WeatherRepository);

    jest.clearAllMocks();
  });

  describe('getWeatherList', () => {
    it('should return paginated weather list', async () => {
      const mockWeathers = [
        createMockWeather({ id: 'weather-1' }),
        createMockWeather({ id: 'weather-2' }),
      ];
      jest.spyOn(repository, 'getWeatherList').mockResolvedValue(mockWeathers);

      const result = await service.getWeatherList({ limit: 10 });

      expect(result.data).toEqual(mockWeathers);
      expect(result.count).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(repository.getWeatherList).toHaveBeenCalledWith(
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const mockWeathers = Array.from({ length: 11 }, (_, i) =>
        createMockWeather({ id: `weather-${i}` }),
      );
      jest.spyOn(repository, 'getWeatherList').mockResolvedValue(mockWeathers);

      const result = await service.getWeatherList({ limit: 10 });

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('weather-9');
    });

    it('should set hasPrevious when cursor is present', async () => {
      jest.spyOn(repository, 'getWeatherList').mockResolvedValue([mockWeather]);

      const result = await service.getWeatherList({
        cursor: 'some-cursor',
        limit: 10,
      });

      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('getWeather', () => {
    it('should return a weather when found', async () => {
      jest.spyOn(repository, 'getWeather').mockResolvedValue(mockWeather);

      const result = await service.getWeather('weather-123');

      expect(result).toEqual(mockWeather);
      expect(repository.getWeather).toHaveBeenCalledWith({ id: 'weather-123' });
    });

    it('should throw NotFoundException when weather not found', async () => {
      jest.spyOn(repository, 'getWeather').mockResolvedValue(null);

      await expect(service.getWeather('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getWeather('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('createWeather', () => {
    it('should create and return a weather', async () => {
      jest.spyOn(repository, 'createWeather').mockResolvedValue(mockWeather);

      const dto = {
        name: 'SUNNY',
        displayName: 'Sunny',
        description: 'A sunny day',
        iconUrl: 'https://example.com/sunny.png',
      };

      const result = await service.createWeather(dto);

      expect(result).toEqual(mockWeather);
      expect(repository.createWeather).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateWeather', () => {
    it('should update and return a weather', async () => {
      const updatedWeather = createMockWeather({ displayName: 'Very Sunny' });
      jest.spyOn(repository, 'updateWeather').mockResolvedValue(updatedWeather);

      const dto = { displayName: 'Very Sunny' };
      const result = await service.updateWeather(dto, mockWeather);

      expect(result).toEqual(updatedWeather);
      expect(repository.updateWeather).toHaveBeenCalledWith(
        { id: 'weather-123' },
        dto,
      );
    });
  });

  describe('deleteWeather', () => {
    it('should delete and return a weather', async () => {
      jest.spyOn(repository, 'deleteWeather').mockResolvedValue(mockWeather);

      const result = await service.deleteWeather(mockWeather);

      expect(result).toEqual(mockWeather);
      expect(repository.deleteWeather).toHaveBeenCalledWith({
        id: 'weather-123',
      });
    });
  });
});
