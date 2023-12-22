import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";

export async function mint(session: Session, token: string, id: number){
    let transaction
    let accepted
    let status
    let error
    try {
        transaction = await session.mint(Address.fromString(token), BigInt(id))
        accepted = await transaction.receipt
        status = accepted.status
        error = accepted.error
    } catch (err){
        status = 0
        error = err
    }
    return { status, error }
}