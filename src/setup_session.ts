import { ethers } from "ethers";
import { Session } from "@polycrypt/erdstall";
// import { Address } from "@polycrypt/erdstall/ledger";
const erdOperatorUrl = new URL("wss://operator.goerli.erdstall.dev:8401/ws"); // local Erdstall Operator
const url = "http://127.0.0.1:8545/"; // Ganache 
const provider = new ethers.providers.JsonRpcProvider(url);
// create custodial session

export async function newSession() {
  try {
    const { session, privateKey } = Session.generateCustodial(provider, erdOperatorUrl);
    await session.initialize()
    await session.subscribe()
    return { session, privateKey }
  } catch(err) {
    alert(err)
  }
}
export async function restoreSession(privateKey: string) {
  try {
    const session = Session.restoreCustodial(provider, erdOperatorUrl, privateKey)
    await session.initialize()
    await session.subscribe()
    return session
  } catch(err) {
    alert(err)
  }
}