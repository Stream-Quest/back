import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from '../all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: Record<string, unknown>;
  let mockHost: ArgumentsHost;

  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      method: 'GET',
      url: '/test-url',
      body: { foo: 'bar' },
      params: { id: '123' },
      query: { limit: '10' },
      headers: { authorization: 'Bearer xxx' },
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('HttpException handling', () => {
    it('should use exception status and string message', () => {
      process.env.NODE_ENV = 'production';
      const exception = new HttpException(
        'Forbidden action',
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Forbidden action',
          path: '/test-url',
        }),
      );
    });

    it('should extract message from object response', () => {
      process.env.NODE_ENV = 'production';
      const exception = new HttpException(
        {
          statusCode: 400,
          message: ['field is required'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['field is required'],
        }),
      );
    });

    it('should fall back to default message when object response has no message', () => {
      process.env.NODE_ENV = 'production';
      const exception = new HttpException(
        { statusCode: 400 } as never,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal server error',
        }),
      );
    });
  });

  describe('non-HttpException Error handling', () => {
    it('should use error message and 500 status', () => {
      process.env.NODE_ENV = 'production';
      const exception = new Error('Something broke');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something broke',
        }),
      );
    });
  });

  describe('unknown thrown value handling', () => {
    it('should use default message when exception is not an Error', () => {
      process.env.NODE_ENV = 'production';

      filter.catch('a raw string throw', mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );
    });
  });

  describe('debug info', () => {
    it('should include debug details when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      const exception = new Error('Dev error');

      filter.catch(exception, mockHost);

      const jsonArg = mockResponse.json.mock.calls[0][0];
      expect(jsonArg.debug).toEqual(
        expect.objectContaining({
          method: 'GET',
          body: { foo: 'bar' },
          params: { id: '123' },
          query: { limit: '10' },
          headers: { authorization: 'Bearer xxx' },
          exception: expect.objectContaining({
            name: 'Error',
            message: 'Dev error',
          }),
        }),
      );
    });

    it('should include raw exception in debug when not an Error instance', () => {
      process.env.NODE_ENV = 'development';

      filter.catch('raw string', mockHost);

      const jsonArg = mockResponse.json.mock.calls[0][0];
      expect(jsonArg.debug.exception).toBe('raw string');
    });

    it('should omit debug details when NODE_ENV is not development', () => {
      process.env.NODE_ENV = 'production';
      const exception = new Error('Prod error');

      filter.catch(exception, mockHost);

      const jsonArg = mockResponse.json.mock.calls[0][0];
      expect(jsonArg.debug).toBeUndefined();
    });
  });
});
