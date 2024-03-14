import { ethers } from "ethers";
import { Client } from "@polycrypt/erdstall";

const erdOperatorUrl = new URL("wss://operator.goerli.erdstall.dev:8401/ws"); // local Erdstall Operator
const url = "http://127.0.0.1:8545/"; // Ganache 
const provider = new ethers.providers.JsonRpcProvider(url);

/**
 * Asynchronously sets up a new client, initializing and subscribing it to the desired services.
 * If successful, returns the new client instance. If an error occurs, it displays an alert with the error message.
 *
 * @returns The newly created and initialized client, if the setup process is successful.
 */
export async function setupClient() {
    try {
        const client = new Client(provider, erdOperatorUrl)
        await client.initialize()
        await client.subscribe()
        return client
    } catch (error) {
        alert(error)
    }
}
