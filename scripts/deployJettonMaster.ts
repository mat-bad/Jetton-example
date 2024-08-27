import { toNano, Address, Cell } from '@ton/core';
import { JettonMaster, getDefaultConfig } from '../wrappers/JettonMaster';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent, encodeOnChainContent} from '../wrappers/JettonUtils';

export async function run(provider: NetworkProvider) {
    
    let config = await getDefaultConfig();

    const jettonMaster = provider.open(JettonMaster.createFromConfig(config, await compile('JettonMaster')));

    console.log("https://testnet.tonviewer.com/" + jettonMaster.address);

    await jettonMaster.sendDeploy(provider.sender(), toNano('0.1'));

    await provider.waitForDeploy(jettonMaster.address);

    // run methods on `jettonMaster`
}
