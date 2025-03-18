import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskService } from './task/task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaProducerService } from './kafka/kafka.producer';
import { Web3Service } from './web3/web3.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot()
  ],
  controllers: [],
  providers: [TaskService, Web3Service, KafkaProducerService],
})
export class AppModule { }
