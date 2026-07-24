import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../guard/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  const createMockContext = (
    cookies: Record<string, string> = {},
  ): ExecutionContext => {
    const request = { signedCookies: cookies, user: undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: { verify: jest.fn() },
        },
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
    jwtService = module.get(JwtService);
    reflector = module.get(Reflector);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access to public routes without checking token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const context = createMockContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should call reflector with IS_PUBLIC_KEY on handler and class', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const context = createMockContext();

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should throw UnauthorizedException when no token is provided', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = createMockContext({});

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Invalid token'),
      );
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should allow access and attach user when token is valid', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockPayload = { sub: 'user-123', username: 'testuser' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      const context = createMockContext({ access_token: 'valid-token' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when token is invalid or expired', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('jwt expired');
      });
      const context = createMockContext({ access_token: 'expired-token' });

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Invalid or expired token'),
      );
    });
  });
});
