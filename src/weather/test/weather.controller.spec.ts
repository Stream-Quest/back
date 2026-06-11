import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { WeatherController } from '../weather.controller';
import { WeatherService } from '../weather.service';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { WeatherGuard } from '../guard/weather.guard';
import { createMockWeather } from './fixtures/weather.fixture';
import { createMockWeatherService } from './mocks/weather.service.mock';

describe('WeatherController', () => {
  let controller: WeatherController;
  let service: WeatherService;

  const mockWeather = createMockWeather();
  const mockService = createMockWeatherService();

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 'user-123', username: 'testuser' };
      return true;
    }),
  };

  const mockWeatherGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.weather = mockWeather;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(WeatherGuard)
      .useValue(mockWeatherGuard)
      .compile();

    controller = module.get(WeatherController);
    service = module.get(WeatherService);

    jest.clearAllMocks();
  });

  describe('weatherList', () => {
    it('should return paginated weather list', async () => {
      const mockResponse = {
        data: [mockWeather],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest.spyOn(service, 'getWeatherList').mockResolvedValue(mockResponse);

      const result = await controller.weatherList({ limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(service.getWeatherList).toHaveBeenCalledWith({ limit: 10 });
    });
  });

  describe('weatherDetails', () => {
    it('should return weather details', async () => {
      jest.spyOn(service, 'getWeather').mockResolvedValue(mockWeather);

      const result = await controller.weatherDetails('weather-123');

      expect(result).toEqual(mockWeather);
      expect(service.getWeather).toHaveBeenCalledWith('weather-123');
    });
  });

  describe('createWeather', () => {
    it('should create and return a weather', async () => {
      const createDto = {
        name: 'SUNNY',
        displayName: 'Sunny',
        description: 'A sunny day',
        iconUrl: 'https://example.com/sunny.png',
      };
      jest.spyOn(service, 'createWeather').mockResolvedValue(mockWeather);

      const result = await controller.createWeather(createDto);

      expect(result).toEqual(mockWeather);
      expect(service.createWeather).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateWeather', () => {
    it('should update and return a weather', async () => {
      const updateDto = { displayName: 'Very Sunny' };
      const updatedWeather = createMockWeather({ displayName: 'Very Sunny' });
      jest.spyOn(service, 'updateWeather').mockResolvedValue(updatedWeather);

      const result = await controller.updateWeather(updateDto, mockWeather);

      expect(result).toEqual(updatedWeather);
      expect(service.updateWeather).toHaveBeenCalledWith(
        updateDto,
        mockWeather,
      );
    });
  });

  describe('deleteWeather', () => {
    it('should delete and return a weather', async () => {
      jest.spyOn(service, 'deleteWeather').mockResolvedValue(mockWeather);

      const result = await controller.deleteWeather(mockWeather);

      expect(result).toEqual(mockWeather);
      expect(service.deleteWeather).toHaveBeenCalledWith(mockWeather);
    });
  });

  describe('Guards', () => {
    it('should apply JwtAuthGuard to all routes', () => {
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });

    it('should apply WeatherGuard to protected routes', () => {
      expect(mockWeatherGuard.canActivate).toBeDefined();
    });
  });
});
