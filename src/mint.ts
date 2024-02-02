import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
import { htmlTransferAndMintWindow } from "./transfer";
import * as utils from "./utils.ts";

export function htmlMint(div_mint:HTMLDivElement, session: Session){
    div_mint.innerHTML = `
    <form class="mint-form">
        <input type="checkbox" id="multiple">mint multiple tokens</checkbox>
        <input type="text" placeholder="token address (ex. 0x1234...)" />
        <input type="button" value="generate random address">
        <input type="text" placeholder="token ID" />
        <input type="button" value="mint new token" />
    </form>
    `
    const txt_tokenAddress = 
        document.querySelector<HTMLInputElement>(".mint-form input[placeholder='token address (ex. 0x1234...)']")!;

    const txt_tokenID = 
        document.querySelector<HTMLInputElement>(".mint-form input[placeholder='token ID']")!;

    const chk_multiple = 
        document.querySelector<HTMLInputElement>("#multiple")!;
    chk_multiple.addEventListener('click', () => txt_tokenID.placeholder = chk_multiple.checked ? "amount" : "token ID")
    
    const btn_mint = 
        document.querySelector<HTMLInputElement>('.mint-form input[value="mint new token"]' )!;
    btn_mint.addEventListener("click", async () => chk_multiple.checked ? eventMultipleMint(session) : eventSingleMint(session));
    
    const btn_randomAddress = 
        document.querySelector<HTMLInputElement>('.mint-form input[value="generate random address"]' )!;
    btn_randomAddress.addEventListener("click", () => txt_tokenAddress.value = utils.generateRandomAddress());
}

async function eventSingleMint(session: Session){
    const txt_tokenAddress = document.querySelector<HTMLInputElement>(
        ".mint-form input[placeholder='token address (ex. 0x1234...)']"
    )!;
    const txt_tokenID = document.querySelector<HTMLInputElement>(
        ".mint-form input[placeholder='token ID']"
    )!;
    const tokenAddress = txt_tokenAddress.value
    const tokenID = txt_tokenID.value
    const { valid, message } = checkInputsForMint(tokenAddress, "1", tokenID)
    if (!valid){
        alert(message)
        return
    }
    const { status, error } = await mint(
        session,
        tokenAddress,
        BigInt(parseFloat(tokenID))
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

async function eventMultipleMint(session: Session){
    const txt_tokenAddress = document.querySelector<HTMLInputElement>(
        ".mint-form input[placeholder='token address (ex. 0x1234...)']"
    )!;
    const txt_amount = document.querySelector<HTMLInputElement>(
        ".mint-form input[placeholder='amount']"
    )!;
    const tokenAddress = txt_tokenAddress.value
    const amount = txt_amount.value
    const { valid, message } = checkInputsForMint(tokenAddress, amount)
    if (!valid){
        alert(message)
        return
    }
    await multipleMint(session, tokenAddress, parseFloat(amount))
    alert("Tokens succesfully minted!")
    await htmlTransferAndMintWindow()
}

function checkInputsForMint(tokenAddress:string, amount:string, tokenID?:string) : { valid: boolean, message: string }{
    let valid = true
    let message = ""
    let result
    result = utils.checkTokenAddress(tokenAddress)
    if(!result.valid){
        valid = result.valid
        message = result.message
        return { valid, message }
    }
    result = utils.checkAmount(amount)
    if(!result.valid){
        valid = result.valid
        message = result.message
        return { valid, message }
    }
    if (tokenID != undefined) {
        result = utils.checkTokenID(tokenID)
        if(!result.valid){
            valid = result.valid
            message = result.message
            return { valid, message }
        }
    }
    return { valid, message }
}

/**
 * Function to mint a token. 
 * @param session The session in which the token will minted in.
 * @param token Token address to mint of.
 * @param id Token ID to mint. Has to be non existing ID.
 * @returns Status and error message
 */
async function mint(session: Session, tokenAddress: string, tokenID: bigint){
    let transaction
    let receipt
    let status
    let error
    try {
        transaction = await session.mint(Address.fromString(tokenAddress), tokenID)
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

async function multipleMint(session: Session, tokenAddress: string, amount: number) : Promise<bigint[]>{
    const tokenIDs : bigint[] = []
    for(let i = 0; i < amount; i++){
        let status = 0
        let tokenID
        while (status == 0){
            const array = new BigUint64Array(1)
            const random = crypto.getRandomValues(array)
            tokenID = random[0]
            const transaction = await mint(session, tokenAddress, tokenID)
            status = <number> transaction.status
        }
        tokenIDs.push(tokenID!)
    }
    return tokenIDs
}