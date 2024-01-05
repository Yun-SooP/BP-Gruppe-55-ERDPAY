import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";


/**
 * Function to mint a token. 
 * @param session The session in which the token will minted in.
 * @param token Token address to mint of.
 * @param id Token ID to mint. Has to be non existing ID.
 * @returns Status and error message
 */
export async function mint(session: Session, token: string, id: number){
    let transaction
    let receipt
    let status
    let error
    try {
        transaction = await session.mint(Address.fromString(token), BigInt(id))
        receipt = await transaction.receipt
        status = receipt.status
        error = receipt.error
    } catch (err){
        status = 0
        error = err
    }
    return { status, error }
}