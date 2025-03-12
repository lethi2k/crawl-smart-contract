import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as contractABI from '../abi/SimpleToken.json';
import { AbstractWeb3Service } from 'src/common/abstract-web3.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer';

@Injectable()
export class Web3Service extends AbstractWeb3Service {
    private readonly ABI = contractABI.abi;

    constructor(
        protected readonly kafkaService: KafkaProducerService,
    ) {
        super(kafkaService);
        this.contract = new this.web3.eth.Contract(
            this.ABI,
            process.env.CONTRACT_ADDRESS
        );
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    handleCron() {
        this.fetchEvents();
    }

    private async fetchEvents() {
        try {
            const events = await this.getEvents(this.ABI, process.env.CONTRACT_ADDRESS, 'NewWallet');
            if (events.length > 0) {
                await this.processCreateWalletDetails(events, process.env.CREATE_WALLET_TOPIC);
            } else {
                this.logger.log('No new events found.');
            }
        } catch (error) {
            this.logger.error(`Error in fetchEvents: ${error.message}`);
        }
    }
}