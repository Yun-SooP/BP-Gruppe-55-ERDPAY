import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";

export async function mint(session: Session, token: string, id: number){
    let transaction
    let receipt
    let status
    let error
    if (Number.isNaN(id) || id <= 0 || !Number.isInteger(id)){
        status = 0
        error = new Error("Please enter a valid ID.")
        return { status, error }
    } 
    try {
        transaction = await session.mint(Address.fromString(token), BigInt(id))
        receipt = await transaction.receipt
        status = receipt.status
        error = receipt.error
        if (error == "processing *tee.MintTX: duplicate mint [nonce increased]"){
            error = new Error("There is a duplicate token to the given token address and token ID. Please try again with a different token address or ID.")
        }
    } catch (err){
        status = 0
        error = err
        if (error?.toString().includes("invalid arrayify value") || error?.toString().includes("hex data is odd-length")){
            error = new Error("Please enter a valid token address.")
        }
    }
    return { status, error }
}