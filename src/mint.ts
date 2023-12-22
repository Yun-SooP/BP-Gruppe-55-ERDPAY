import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";

export async function mint(session: Session, token: string, id: number){
    if (!Number.isInteger(id) || id < 0){
        throw new Error('Invalid ID!')
    }
    const transaction = await session.mint(Address.fromString(token), BigInt(id))
    const accepted = await transaction.receipt
    const status = accepted.status
    const error = accepted.error
    return { status, error }
}