import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as contractABI from '../abi/WalletFactory.json';
import * as eventFactoryABI from '../abi/EventFactory.json';
import * as eventProxyABI from '../abi/EventFactory.json';
import { Web3Service } from 'src/web3/web3.service';

@Injectable()
export class TaskService {
    private readonly walletABI = contractABI.abi;
    private readonly eventFactoryABI = eventFactoryABI.abi;
    private readonly eventProxyABI = eventProxyABI.abi;
    private readonly logger = new Logger(TaskService.name);

    constructor(
        private readonly web3Service: Web3Service,
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleCronWallet() {
        try {
            const contractAddress = process.env.WALLET_FACTORY_CONTRACT_ADDRESS;
            if (!contractAddress) {
                this.logger.error('Missing WALLET_FACTORY_CONTRACT_ADDRESS in env');
                return;
            }

            const events = await this.web3Service.getEvents(this.walletABI, contractAddress, 'NewWallet');
            if (events.length > 0) {
                await this.web3Service.processCreateWalletDetails(events, process.env.CREATE_WALLET_TOPIC);
            } else {
                this.logger.log('No new events found.');
            }
        } catch (error) {
            this.logger.error(`Error in fetchEvents: ${error.message}`);
        }
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleCronCreateEventTopic() {
        try {
            const contractAddress = process.env.EVENT_FACTORY_CONTRACT_ADDRESS;
            if (!contractAddress) {
                this.logger.error('Missing EVENT_FACTORY_CONTRACT_ADDRESS in env');
                return;
            }

            const events = await this.web3Service.getEvents(this.eventFactoryABI, contractAddress, 'NewEvent');
            if (events.length > 0) {
                await this.web3Service.processEventTopic(events, process.env.CREATE_EVENT_TOPIC);
            } else {
                this.logger.log('No new events found.');
            }
        } catch (error) {
            this.logger.error(`Error in fetchEvents: ${error.message}`);
        }
    }

    // @Cron(CronExpression.EVERY_10_SECONDS)
    // async handleCronInvestTopic() {
    //     try {
    //         const contractAddress = process.env.EVENT_PROXY_CONTRACT_ADDRESS;
    //         if (!contractAddress) {
    //             this.logger.error('Missing EVENT_PROXY_CONTRACT_ADDRESS in env');
    //             return;
    //         }

    //         const events = await this.web3Service.getEvents(this.eventProxyABI, contractAddress, 'eventContract');
    //         if (events.length > 0) {
    //             await this.web3Service.processEventTopic(events, process.env.INVEST_TOPIC);
    //         } else {
    //             this.logger.log('No new events found.');
    //         }
    //     } catch (error) {
    //         this.logger.error(`Error in fetchEvents: ${error.message}`);
    //     }
    // }

    // @Cron(CronExpression.EVERY_10_SECONDS)
    // async handleCronDistributedReward() {
    //     try {
    //         const contractAddress = process.env.EVENT_PROXY_CONTRACT_ADDRESS;
    //         if (!contractAddress) {
    //             this.logger.error('Missing EVENT_PROXY_CONTRACT_ADDRESS in env');
    //             return;
    //         }

    //         const events = await this.web3Service.getEvents(this.eventProxyABI, contractAddress, 'eventContract');
    //         if (events.length > 0) {
    //             await this.web3Service.processEventTopic(events, process.env.DISTRIBUTED_REWARD_TOPIC);
    //         } else {
    //             this.logger.log('No new events found.');
    //         }
    //     } catch (error) {
    //         this.logger.error(`Error in fetchEvents: ${error.message}`);
    //     }
    // }

    // @Cron(CronExpression.EVERY_10_SECONDS)
    // async handleCronRefundTopic() {
    //     try {
    //         const contractAddress = process.env.EVENT_PROXY_CONTRACT_ADDRESS;
    //         if (!contractAddress) {
    //             this.logger.error('Missing EVENT_PROXY_CONTRACT_ADDRESS in env');
    //             return;
    //         }

    //         const events = await this.web3Service.getEvents(this.eventProxyABI, contractAddress, 'eventContract');
    //         if (events.length > 0) {
    //             await this.web3Service.processEventTopic(events, process.env.DISTRIBUTED_REWARD_TOPIC);
    //         } else {
    //             this.logger.log('No new events found.');
    //         }
    //     } catch (error) {
    //         this.logger.error(`Error in fetchEvents: ${error.message}`);
    //     }
    // }
}
