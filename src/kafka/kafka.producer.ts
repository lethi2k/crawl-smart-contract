import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'nestjs-client',
      brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
    });

    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka Producer Connected');
  }

  async sendMessage(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      this.logger.log(`Message sent to Kafka: ${JSON.stringify(message)}`);
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
    }
  }
}
