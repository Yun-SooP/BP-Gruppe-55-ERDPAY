import { ethers } from "ethers";
import { Client } from "@polycrypt/erdstall";
import { Address} from "@polycrypt/erdstall/ledger";

const erdOperatorUrl = new URL("wss://operator.goerli.erdstall.dev:8401/ws"); // local Erdstall Operator
const url = "http://127.0.0.1:8545/"; // Ganache 
const provider = new ethers.providers.JsonRpcProvider(url);
// create custodial session

const erdClient = new Client(provider, erdOperatorUrl)
erdClient.initialize().then(()=>
  erdClient.subscribe()
)

export function setupClient(button: HTMLButtonElement, input: HTMLInputElement, arrayDisp: HTMLBodyElement) {

    button.innerHTML = `View Balance`
    button.addEventListener('click', () => {
        const BalAddres = Address.fromString(input.value)
        erdClient.getAccount(BalAddres).then((value) => {
            const valueArr = Array.from(value.values.values.entries())
            let assets = ""
            for (let i = 0; i < valueArr.length; i++) {
                let asset = valueArr[i]
                assets += "Token: " + asset[0] + " ID: " + parseInt(asset[1].toJSON())
            }
            arrayDisp.innerHTML = assets
        })
    })
}
