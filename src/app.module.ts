import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Web3Service } from './web3/web3.service';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaProducerService } from './kafka/kafka.producer';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot()
  ],
  controllers: [],
  providers: [Web3Service, KafkaProducerService],
})
export class AppModule { }
