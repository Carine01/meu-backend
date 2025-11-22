import { Controller, Get, Post, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, retryWhen, scan, mergeMap, timer, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(private readonly httpService: HttpService) {}

  @Get('mock500')
  mock500() {
    // endpoint para testar retry: sempre retorna 500
    return {
      statusCode: 500,
      message: 'Simulated server error',
    } as any;
  }

  @Post('retry')
  async triggerRetry() {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;
    const url = 'http://localhost:3000/test/mock500';

    const request$ = this.httpService.post(url, { test: true }).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc: any, error: AxiosError) => ({ count: acc.count + 1, error }), { count: 0, error: null }),
          mergeMap((acc: any) => {
            const error = acc.error as AxiosError;
            const isRecoverable = !error.response || (error.response.status >= 500 && error.response.status < 600);
            if (acc.count > MAX_RETRIES || !isRecoverable) {
              throw error;
            }
            const delayTime = RETRY_DELAY_MS * Math.pow(2, acc.count - 1);
            this.logger.warn(`TriggerRetry: tentativa ${acc.count}/${MAX_RETRIES} falhou. Retentando em ${delayTime}ms`);
            return timer(delayTime);
          }),
        ),
      ),
      catchError(err => {
        throw err;
      }),
    );

    try {
      const resp = await firstValueFrom(request$);
      return { ok: true, data: resp.data };
    } catch (err: any) {
      this.logger.error('TriggerRetry: falha final após retries');
      return { ok: false, error: err?.message || err }; 
    }
  }
}

