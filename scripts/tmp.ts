import { toNano, Address, Cell } from '@ton/core';
import { getDefaultConfig, JettonMaster, JettonMasterConfig } from '../wrappers/JettonMaster';
import { compile, NetworkProvider } from '@ton/blueprint';


export async function run(provider: NetworkProvider) {

    let config = await getDefaultConfig();
    /*let config = {
        totalSupply : BigInt(0),
        adminAddress: Address.parse("0QBRYx5XOD-hzpGZmFENSZQvAsRqlcYc65SGHTsiGL7QMJnl"),
        metadata: Cell.fromBase64("te6ccgEBAQEARQAAhgFpcGZzOi8vYmFma3JlaWFzdDRmcWxrcDR1cHl1MmN2bzdmbjdhYWJqdXN4NzY1eXp2cWl0c3I0cnB3ZnZoamd1aHk="),
        jettonWalletCode: await compile('JettonWallet')
    }*/

    const jettonMaster = provider.open(JettonMaster.createFromConfig(config, await compile('JettonMaster')));
    console.log(jettonMaster.address);
    let senderAddress = provider.sender().address;
    console.log(config.adminAddress.toRawString());
    if(senderAddress != undefined){

        console.log(senderAddress.toRawString());
    }
    

}