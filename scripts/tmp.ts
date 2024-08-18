import { toNano, Address, Cell } from '@ton/core';
import { JettonMaster, JettonMasterConfig } from '../wrappers/JettonMaster';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    let config = {
        totalSupply : BigInt(0),
        adminAddress: Address.parse("kQBRYx5XOD-hzpGZmFENSZQvAsRqlcYc65SGHTsiGL7QMMQg"),
        metadata: await compile('JettonWallet'),//Cell.fromBase64("b5ee9c7201010101004500008601697066733a2f2f6261666b7265696173743466716c6b7034757079753263766f37666e376161626a757378373635797a767169747372347270776676686a67756879"),
        jettonWalletCode: await compile('JettonWallet')
    }

    const jettonMaster = provider.open(JettonMaster.createFromConfig(config, await compile('JettonMaster')));
    console.log(jettonMaster.address);

}