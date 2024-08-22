import { toNano, Address, Cell } from '@ton/core';
import { getDefaultConfig, JettonMaster, JettonMasterConfig } from '../wrappers/JettonMaster';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent } from '../wrappers/JettonUtils';


export async function run(provider: NetworkProvider) {
    /*
    let config = await getDefaultConfig();
    
    const jettonMaster = provider.open(JettonMaster.createFromConfig(config, await compile('JettonMaster')));
    console.log(jettonMaster.address);
    let senderAddress = provider.sender().address;
    console.log(config.adminAddress.toRawString());
    if(senderAddress != undefined){

        console.log(senderAddress.toRawString());
    }
    */

    let st1 = "68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f6d61742d6261642f6d792d6e6f7465626f6f6b2f6d61696e2f434b542e6a736f6e"
    let st2 = "b5ee9c720101010100460000880168747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f6d61742d6261642f6d792d6e6f7465626f6f6b2f6d61696e2f434b542e6a736f6e"
    let st3 = "b5ee9c7201010101004500008601697066733a2f2f6261666b7265696173743466716c6b7034757079753263766f37666e376161626a757378373635797a767169747372347270776676686a67756879"
    let st4 = "b5ee9c7201010701007d00010300c00102012002030143bff872ebdb514d9c97c283b7f0ae5179029e2b6119c39462719e4f46ed8f7413e640040143bff7407e978f01a40711411b1acb773a96bdd93fa83bb5ca8435013c8c4b3ac91f400601020005003e68747470733a2f2f7465746865722e746f2f757364742d746f6e2e6a736f6e00040036";
    let st5 = "01697066733A2F2F6261666B7265696173743466716C6B7034757079753263766F37666E376161626A757378373635797A767169747372347270776676686A67756879";
    console.log(st1.length);
    console.log(st4);
    
}