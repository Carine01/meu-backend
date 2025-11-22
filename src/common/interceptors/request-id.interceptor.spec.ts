import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { RequestIdInterceptor } from './request-id.interceptor';

describe('RequestIdInterceptor', () => {
  let interceptor: RequestIdInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestIdInterceptor],
    }).compile();

    interceptor = module.get<RequestIdInterceptor>(RequestIdInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should add request ID to response headers', (done) => {
    const mockRequest = { headers: {} };
    const mockResponse = { 
      setHeader: jest.fn(),
    };
    
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({}),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'x-request-id',
        expect.any(String)
      );
      expect(mockRequest).toHaveProperty('requestId');
      done();
    });
  });

  it('should use existing request ID from headers', (done) => {
    const existingRequestId = 'test-request-id-123';
    const mockRequest: any = { 
      headers: { 'x-request-id': existingRequestId } 
    };
    const mockResponse = { 
      setHeader: jest.fn(),
    };
    
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({}),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'x-request-id',
        existingRequestId
      );
      expect(mockRequest.requestId).toBe(existingRequestId);
      done();
    });
  });
});
