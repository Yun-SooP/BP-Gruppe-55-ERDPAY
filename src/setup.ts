import { ethers } from "ethers";
import { Session } from "@polycrypt/erdstall";
// import { Address } from "@polycrypt/erdstall/ledger";
const erdOperatorUrl = new URL("wss://operator.goerli.erdstall.dev:8401/ws"); // local Erdstall Operator
const url = "http://127.0.0.1:8545/"; // Ganache 
const provider = new ethers.providers.JsonRpcProvider(url);
// create custodial session
const { session, privateKey } = Session.generateCustodial(provider, erdOperatorUrl);
session.initialize().then(()=>
  session.subscribe()
)
export function setupSession(element: HTMLButtonElement) {
  element.innerHTML = `Your private key`
  element.addEventListener('click', () => alert(privateKey))
}
