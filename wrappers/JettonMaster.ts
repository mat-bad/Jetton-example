import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import { compile } from '@ton/blueprint';
import { encodeOffChainContent } from './JettonUtils';

export type JettonMasterConfig = {
    totalSupply: bigint,
    adminAddress: Address,
    metadata: Cell,
    jettonWalletCode: Cell
};

export type JettonData = {
    totalSupply: bigint,
    mintable: boolean,
    adminAddress: Address,
    metadata: Cell,
    jettonWalletCode: Cell
};

export const Opcodes = {
    transfer : 0xf8a7ea5,
    transfer_notification : 0x7362d09c,
    internal_transfer : 0x178d4519,
    excesses : 0xd53276db,
    burn : 0x595f07bc,
    burn_notification : 0x7bdd97de,
    mint : 21,
    change_admin: 22,
    change_metadata: 23
};

export async function getDefaultConfig() : Promise<JettonMasterConfig> {
    return {
        totalSupply : BigInt(0),
        adminAddress: Address.parse("kQBRYx5XOD-hzpGZmFENSZQvAsRqlcYc65SGHTsiGL7QMMQg"),
        metadata: encodeOffChainContent("https://tether.to/usdt-ton.json"),//Cell.fromBase64("te6ccgEBAQEARgAAiAFpcGZzOi8vYmFma3JlaWFzdDRmcWxrcDR1cHl1MmN2bzdmbjdhYWJqdXN4NzY1eXp2cWl0c3I0cnB3ZnZoamd1aHk="),
        jettonWalletCode: await compile('JettonWallet')
    }
}

export function jettonMasterConfigToCell(config: JettonMasterConfig): Cell {
    return beginCell()
        .storeCoins(config.totalSupply)
        .storeAddress(config.adminAddress)
        .storeRef(config.metadata)
        .storeRef(config.jettonWalletCode)
    .endCell();
}

export class JettonMaster implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new JettonMaster(address);
    }

    static createFromConfig(config: JettonMasterConfig, code: Cell, workchain = 0) {
        const data = jettonMasterConfigToCell(config);
        const init = { code, data };
        return new JettonMaster(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMint(
        provider: ContractProvider,
        via: Sender,
        opts: {
            amount: bigint;
            value: bigint;
            forwardAmount: bigint
            queryID?: number;
            senderAddress: Address;

        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.mint, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.senderAddress)
                .storeCoins(opts.forwardAmount)
                .storeRef(
                    beginCell()
                    .storeUint(Opcodes.internal_transfer, 32)
                    .storeUint(opts.queryID ?? 0, 64)
                    .storeCoins(opts.amount)
                    .storeAddress(opts.senderAddress)
                    .storeAddress(opts.senderAddress)
                    .storeCoins(0)
                    .endCell()
                )
                .endCell(),
        });
    }

    async sendChangeMetadata(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            newMetadata: Cell;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.change_metadata, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeRef(opts.newMetadata)
                .endCell(),
        });
    }

    async getJettonMetadata(provider: ContractProvider) : Promise<JettonData> {
        const result = await provider.get('get_jetton_data', []);
        return {
            totalSupply: result.stack.readBigNumber(),
            mintable: result.stack.readNumber() != 0,
            adminAddress: result.stack.readAddress(),
            metadata: result.stack.readCell(),
            jettonWalletCode: result.stack.readCell()
        }
    }
}
