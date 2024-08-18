import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

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
