import { Address, toNano, Sender } from '@ton/core';
import { JettonMaster, getDefaultConfig } from '../wrappers/JettonMaster';
import { NetworkProvider, sleep, compile} from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {

    let config = await getDefaultConfig();

    const jettonMaster = provider.open(JettonMaster.createFromConfig(config, await compile('JettonMaster')));
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
    await jettonMaster.sendMint(sender, {
        amount: BigInt(300),
        value: toNano('0.2'),
        senderAddress: sender.address,
        forwardAmount: toNano('0.1')
    });

    ui.clearActionPrompt();
    ui.write('Mint message sent successfully!');
}