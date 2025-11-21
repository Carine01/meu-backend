import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { HttpModule } from '@nestjs/axios';
import { LeadsModule } from './leads/leads.module';
import { TestController } from './test/test.controller';
import { AuthTestController } from './auth-test.controller';
import { FirestoreController } from './firestore/firestore.controller';
import { FirestoreService } from './firestore/firestore.service';
import { validationSchema } from './config/config.schema';
import { HealthController } from './health/health.controller';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
// Importe seus outros módulos aqui (LeadsModule, FlowModule, etc.)

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: '.env',
    }),
    
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
    HttpModule,
    // FlowModule,
    // ...
  ],
  controllers: [HealthController, TestController, AuthTestController, FirestoreController],
  providers: [FirebaseAuthService, FirebaseAuthGuard, FirestoreService],
})
export class AppModule {}
