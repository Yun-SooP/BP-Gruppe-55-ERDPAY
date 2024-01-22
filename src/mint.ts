import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
import { htmlTransferAndMintWindow } from "./transfer";


export async function htmlMint(div_mint:HTMLDivElement, session: Session){
    div_mint.innerHTML = `
    <form class="mint-form">
        <input type="text" placeholder="token address" />
        <input type="text" placeholder="token ID" />
        <input type="button" value="mint new token" />
    </form>
    `
    const btn_mint = document.querySelector<HTMLInputElement>(
        '.mint-form input[value="mint new token"]'
    )!;

    btn_mint.addEventListener("click", async () => eventMint(session));
}

async function eventMint(session: Session){
    const txt_tokenAddress = document.querySelector<HTMLInputElement>(
        ".mint-form input[placeholder='token address']"
    )!;
    const txt_tokenId = document.querySelector<HTMLInputElement>(
        ".mint-form input[placeholder='token ID']"
    )!;
    const tokenId = parseFloat(txt_tokenId.value)
    if (Number.isNaN(tokenId) || tokenId <= 0 || !Number.isInteger(tokenId)){
        alert("Please enter a valid ID.")
    } 
    const { status, error } = await mint(
        session,
        txt_tokenAddress.value,
        parseFloat(txt_tokenId.value)
    );
    if (status == 0) {
        const err: Error = <Error>error;
        alert("Minting failed: " + err.message);
        return;
    } else if (status == 1) {
        alert("Token succesfully minted!");
    }
    await htmlTransferAndMintWindow();
}
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