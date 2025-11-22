import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LeadsModule } from './leads/leads.module';
import { ProfileModule } from './profile/profile.module';
import { TestController } from './test/test.controller';
import { AuthTestController } from './auth-test.controller';
import { FirestoreController } from './firestore/firestore.controller';
import { FirestoreService } from './firestore/firestore.service';
import { validationSchema } from './config/config.schema';
import { HealthController } from './health/health.controller';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { IndicacoesModule } from './modules/indicacoes/indicacoes.module';
import { AgendamentosModule } from './modules/agendamentos/agendamentos.module';
import { EventosModule } from './modules/eventos/events.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: '.env',
    }),
    
    // TypeORM - Banco de dados PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'postgres'),
        password: config.get('DATABASE_PASSWORD', 'postgres'),
        database: config.get('DATABASE_NAME', 'elevare_iara'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production', // Apenas em dev
        logging: config.get('NODE_ENV') !== 'production',
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    
    // Schedule - Para CronJobs
    ScheduleModule.forRoot(),
    
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
    
    // Módulos do aplicativo
    AuthModule,
    LeadsModule,
    ProfileModule,
    HttpModule,
    IndicacoesModule,
    AgendamentosModule,
    EventosModule,
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
  ],
})
export class AppModule {}

