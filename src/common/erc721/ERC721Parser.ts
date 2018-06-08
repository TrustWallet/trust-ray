import * as winston from "winston";

import { loadContractABIs } from "../Utils";

export class ERC721Parser {
    private abiDecoder = require("abi-decoder");
    private abiList = loadContractABIs();

    // ERC20    - Transfer
    // ERC721   - Transfer, Approval, approve
    private operationTypes = ["Transfer", "Approval", "approve"];

    constructor() {
        for (const abi of this.abiList) {
            this.abiDecoder.addABI(abi);
        }
    }

    public extractContracts(transactions: any[]): Promise<any[]> {
            if (!transactions) return Promise.resolve([]);

            const contractAddresses: string[] = [];

            transactions.map((transaction: any) => {
                if (transaction.receipt.logs.length === 0 ) return;

                const decodedLogs = this.abiDecoder.decodeLogs(transaction.receipt.logs).filter((log: any) => log);

                if (decodedLogs.length === 0) return;

                decodedLogs.forEach((decodedLog: any) => {
                    if (this.operationTypes.indexOf(decodedLog.name) >= 0) {
                        winston.info(`ERC721Parser.extractContracts(), decodedLog.name: ${decodedLog.name}, transaction: ${transaction._id}, contract: ${decodedLog.address.toLowerCase()}`)
                        contractAddresses.push(decodedLog.address.toLowerCase());
                    }
                })
            });

            const uniqueContractAddresses = [...(new Set(contractAddresses))];

            return Promise.resolve(uniqueContractAddresses);
    }

    /*
    public parse(block) {
        const transactions = this.parseTransactionsInBlock(block);
        const erc721Contracts = this.parseERC721ContractsFromTransactions(transactions);
        this.updateDatabase(transactions, erc721Contracts);
    }

    public parseTransactionsInBlock(block) {
        const transactions = this.extractTransactionsFromBlock(block);
        const receipts = this.fetchReceiptsFromTransactions(transactions);
        const mergedTransactions = this.mergeTransactionsAndReceipts(transactions, receipts);
        return Promise.resolve(mergedTransactions);
    }
    */
}