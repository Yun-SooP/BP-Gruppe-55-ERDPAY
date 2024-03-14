import { ethers } from "ethers";
import { Session } from "@polycrypt/erdstall";

const erdOperatorUrl = new URL("wss://operator.goerli.erdstall.dev:8401/ws"); // local Erdstall Operator
const url = "http://127.0.0.1:8545/"; // Ganache 
const provider = new ethers.providers.JsonRpcProvider(url);

/**
 * Asynchronously creates a new custodial session with a generated private key.
 * Initializes the session, subscribes to necessary events, and returns the session and private key if successful.
 * If an error occurs, it returns an error message.
 *
 * @returns An object containing the initialized session, private key, and any error message.
 */
export async function newSession()  {
  let session
  let privateKey
  let message
  try {
    const newSession_ = Session.generateCustodial(provider, erdOperatorUrl);
    session = newSession_.session
    privateKey = newSession_.privateKey
    await session.initialize()
    await session.subscribe()
  } catch(error) {
    message = error
  }
  return { session, privateKey, message }
}

/**
 * Asynchronously restores a previous custodial session using the provided private key.
 * Initializes the session, subscribes to necessary events, and returns the session.
 * If an error occurs during the process, it returns an error message.
 *
 * @param privateKey The private key of the session to be restored.
 * @returns An object containing the restored and initialized session, and any error message.
 */
export async function restoreSession(privateKey: string) {
  let session
  let message
  try {
    session = Session.restoreCustodial(provider, erdOperatorUrl, privateKey)
    await session.initialize()
    await session.subscribe()
  } catch(error) {
    message = error
  }
  return { session, message }

}