import {
  ArgumentsHost,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaExceptionFilter } from '../prisma-exception.filter';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();

    mockHost = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test-url' }),
      }),
    } as unknown as ArgumentsHost;
  });

  const createPrismaError = (
    code: string,
    meta?: Record<string, unknown>,
  ): PrismaClientKnownRequestError => {
    const error = new PrismaClientKnownRequestError('Prisma error', {
      code,
      clientVersion: '7.8.0',
      meta,
    });
    return error;
  };

  describe('P2025 - record not found', () => {
    it('should throw NotFoundException with capitalized model name', () => {
      const exception = createPrismaError('P2025', { modelName: 'session' });

      expect(() => filter.catch(exception, mockHost)).toThrow(
        new NotFoundException('Session not found'),
      );
    });

    it('should default to "Resource" when modelName is missing', () => {
      const exception = createPrismaError('P2025', {});

      expect(() => filter.catch(exception, mockHost)).toThrow(
        new NotFoundException('Resource not found'),
      );
    });
  });

  describe('P2002 - unique constraint violation', () => {
    it('should throw ConflictException with capitalized field name', () => {
      const exception = createPrismaError('P2002', { target: ['email'] });

      expect(() => filter.catch(exception, mockHost)).toThrow(
        new ConflictException('Email already exists'),
      );
    });

    it('should default to "Field" when target is missing', () => {
      const exception = createPrismaError('P2002', {});

      expect(() => filter.catch(exception, mockHost)).toThrow(
        new ConflictException('Field already exists'),
      );
    });
  });

  describe('unhandled Prisma error codes', () => {
    it('should throw InternalServerErrorException', () => {
      const exception = createPrismaError('P9999');

      expect(() => filter.catch(exception, mockHost)).toThrow(
        new InternalServerErrorException('Database error'),
      );
    });
  });
});
