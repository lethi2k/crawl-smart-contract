import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as contractABI from '../abi/SimpleToken.json';
import { AbstractWeb3Service } from 'src/common/abstract-web3.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer';

@Injectable()
export class Web3Service extends AbstractWeb3Service implements OnModuleInit {
    private readonly ABI = contractABI.abi;

    constructor(
        protected readonly kafkaService: KafkaProducerService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {
        super(kafkaService);
        this.contract = new this.web3.eth.Contract(
            this.ABI,
            process.env.CONTRACT_ADDRESS
        );
    }

    async onModuleInit() {
        this.fetchEvents();
        this.addCronJob();
    }

    private addCronJob() {
        const interval = 10000;
        const callback = async () => {
            this.logger.log('Fetching events every 10 seconds...');
            await this.fetchEvents();
        };

        const intervalRef = setInterval(callback, interval);
        this.schedulerRegistry.addInterval('fetchEventsInterval', intervalRef);
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