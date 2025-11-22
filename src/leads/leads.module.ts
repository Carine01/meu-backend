import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { IARA_CONFIG_TOKEN, IaraConfig } from './iara-config.interface';

@Module({
  imports: [
    HttpModule,
    ConfigModule, 
  ],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    {
      provide: IARA_CONFIG_TOKEN,
      useFactory: (configService: ConfigService): IaraConfig => {
        return {
          edgeUrl: configService.get<string>('IARA_EDGE_URL') || '',
          secret: configService.get<string>('IARA_SECRET') || '',
          defaultClinic: configService.get<string>('DEFAULT_CLINIC') || '',
          defaultOrigem: configService.get<string>('DEFAULT_ORIGEM') || '',
        };
      },
      inject: [ConfigService],
    },
  ],
  exports: [LeadsService],
})
export class LeadsModule {}

