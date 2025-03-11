import { Injectable, Logger } from '@nestjs/common';
import Web3 from 'web3';
import { KafkaProducerService } from 'src/kafka/kafka.producer';

@Injectable()
export abstract class AbstractWeb3Service {
    protected readonly logger = new Logger(this.constructor.name);
    protected web3: Web3;
    protected contract: any;
    private processedTransactions = new Set<string>();

    constructor(protected readonly kafkaService: KafkaProducerService) {
        this.web3 = new Web3(process.env.WEB3_PROVIDER_URL || '');
    }

    protected async getEvents(contractABI: any, contractAddress: string, eventName: string) {
        try {
            const latestBlock = await this.web3.eth.getBlockNumber();
            const historicalBlock = latestBlock - BigInt(10000);
            this.logger.log(`Fetching events from block ${historicalBlock} to ${latestBlock}`);

            const contract = new this.web3.eth.Contract(contractABI, contractAddress);
            const events = await contract.getPastEvents(eventName, {
                fromBlock: historicalBlock,
                toBlock: 'latest',
            });

            return events.filter((event: any) => !this.processedTransactions.has(event.transactionHash));
        } catch (error) {
            this.logger.error(`Error fetching events: ${error.message}`);
            throw error;
        }
    }

    protected async processCreateWalletDetails(events: any[], topic: string) {
        for (const event of events) {
            const { metaWallet, meleeWallet } = event.returnValues;

            if (this.processedTransactions.has(event.transactionHash)) {
                this.logger.warn(`Skipping duplicate event: ${event.transactionHash}`);
                continue;
            }

            await this.kafkaService.sendMessage(topic, {
                metaWallet,
                meleeWallet,
                event: event.event,
                transactionHash: event.transactionHash,
            });

            this.processedTransactions.add(event.transactionHash);
        }
    }
}
