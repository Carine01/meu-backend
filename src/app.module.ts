import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LeadsModule } from './leads/leads.module';
import { MetricsModule } from './metrics/metrics.module';
import { TestController } from './test/test.controller';
import { AuthTestController } from './auth-test.controller';
import { FirestoreController } from './firestore/firestore.controller';
import { FirestoreService } from './firestore/firestore.service';
import { validationSchema } from './config/config.schema';
import { HealthController } from './health/health.controller';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
// Importe seus outros módulos aqui (LeadsModule, FlowModule, etc.)

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: '.env',
    }),
    
    // Rate Limiting - Proteção contra DDoS e abuse
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 segundos
      limit: 100,  // 100 requests por IP (ajustável)
    }]),
    
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        pinoHttp: {
          transport:
            config.get('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty' }
              : undefined,
          
          level: config.get('LOG_LEVEL') || 'info',
          
          base: {
            service: 'stalkspot-backend',
            version: '1.0.0',
          },
          
          autoLogging: {
            ignore: (req) => req.url === '/health',
          },
        },
      }),
    }),
    
    // Outros módulos do seu aplicativo
    LeadsModule,
    MetricsModule,
    HttpModule,
    // FlowModule,
    // ...
  ],
  controllers: [HealthController, TestController, AuthTestController, FirestoreController],
  providers: [
    FirebaseAuthService, 
    FirebaseAuthGuard, 
    FirestoreService,
    // Rate Limiting global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Request ID tracking global
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
  ],
})
export class AppModule {}
