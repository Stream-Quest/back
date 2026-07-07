import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WeatherGuard } from '../guard/weather.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockWeather } from './fixtures/weather.fixture';

const createMockPrismaService = () => ({
  weather: {
    findUnique: jest.fn(),
  },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    weatherId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: { id: overrides.weatherId ?? 'weather-123' },
    weather: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('WeatherGuard', () => {
  let guard: WeatherGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockWeather = createMockWeather();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get(WeatherGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when weather exists and user is authenticated', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        weatherId: 'weather-123',
      });

      jest
        .spyOn(prismaService.weather, 'findUnique')
        .mockResolvedValue(mockWeather);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach weather to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        weatherId: 'weather-123',
      });
      const request = context.switchToHttp().getRequest();

      jest
        .spyOn(prismaService.weather, 'findUnique')
        .mockResolvedValue(mockWeather);

      await guard.canActivate(context);

      expect(request.weather).toEqual(mockWeather);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        weatherId: 'weather-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when weather id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        weatherId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Weather id not provided',
      );
    });

    it('should throw NotFoundException when weather is not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        weatherId: 'not-found',
      });

      jest.spyOn(prismaService.weather, 'findUnique').mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Weather not found',
      );
    });

    it('should query weather with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        weatherId: 'weather-123',
      });

      jest
        .spyOn(prismaService.weather, 'findUnique')
        .mockResolvedValue(mockWeather);

      await guard.canActivate(context);

      expect(prismaService.weather.findUnique).toHaveBeenCalledWith({
        where: { id: 'weather-123' },
      });
    });
  });
});
