import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { FilaModule } from '../modules/fila/fila.module';
import { CampanhasModule } from '../modules/campanhas/campanhas.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    FilaModule,
    CampanhasModule,
  ],
  providers: [CronService],
})
export class CronModule {}

