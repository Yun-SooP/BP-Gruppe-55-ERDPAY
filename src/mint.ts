import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";

export function mint(session: Session, token: string, id: number){
    if (!Number.isInteger(id) || id < 0){
        throw new Error('Invalid ID!')
    }
    return session.mint(Address.fromString(token), BigInt(id))
}