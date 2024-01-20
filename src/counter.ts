import { ethers } from "ethers";
import { Session } from "@polycrypt/erdstall";
// import { Address } from "@polycrypt/erdstall/ledger";
const erdOperatorUrl = new URL("wss://operator.goerli.erdstall.dev:8401/ws"); // local Erdstall Operator
const url = "http://127.0.0.1:8545/"; // Ganache 
const provider = new ethers.providers.JsonRpcProvider(url);
// create custodial session
const { session, privateKey } = Session.generateCustodial(provider, erdOperatorUrl);
await session.initialize(); // init session
await session.subscribe(); // subscribes to all receipts and balance proofs
// document.querySelector('#privatekey')?.addEventListener('click', () => alert(privateKey));
export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `Your private key`
  }
  element.addEventListener('click', () => alert(privateKey))
  setCounter(0)
}
