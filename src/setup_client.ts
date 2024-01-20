import { ethers } from "ethers";
import { Client } from "@polycrypt/erdstall";

const erdOperatorUrl = new URL("wss://operator.goerli.erdstall.dev:8401/ws"); // local Erdstall Operator
const url = "http://127.0.0.1:8545/"; // Ganache 
const provider = new ethers.providers.JsonRpcProvider(url);

/**
 * sets up a new client
 * @returns new client
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
