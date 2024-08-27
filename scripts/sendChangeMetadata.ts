import { Address, toNano, Sender } from '@ton/core';
import { JettonMaster, getDefaultConfig } from '../wrappers/JettonMaster';
import { NetworkProvider, sleep, compile} from '@ton/blueprint';
import { encodeOffChainContent } from '../wrappers/JettonUtils';

export async function run(provider: NetworkProvider, args: string[]) {

    //let config = await getDefaultConfig();

    //const jettonMaster = provider.open(JettonMaster.createFromConfig(config, await compile('JettonMaster')));
    const jettonMaster = provider.open(JettonMaster.createFromAddress(Address.parse("kQDTbkTg3Jsjwy7Ux6J85RJ75cWkm4ZuP27XUuFWqhR_ks5w")));
    const ui = provider.ui();

    const address = jettonMaster.address;//Address.parse(args.length > 0 ? args[0] : await ui.input('Counter address'));
    ui.write(address.toString());

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    let sender: Sender = provider.sender();
    if(!sender.address) {
        ui.write(`Sender Error`);
        return;
    }
    await jettonMaster.sendChangeMetadata(sender, {
        value: toNano('0.2'),
        newMetadata: encodeOffChainContent("https://mat-bad.github.io/my-notebook/CKT.json")
    });

    ui.clearActionPrompt();
    ui.write('Content changed successfully!');
}