import { Account } from "@polycrypt/erdstall/ledger"
import { Tokens } from "@polycrypt/erdstall/ledger/assets"
import { Asset } from "@polycrypt/erdstall/ledger/assets"

export function checkTokenAddress(tokenAddress: string) : {valid: boolean, message: string} {
    let valid = true
    let message = ""

    if (tokenAddress == ""){
        valid = false
        message = "Please input the tokenAddress."
    }

    const hex = /[0-9A-Fa-f]{40}/g;
    if (tokenAddress.slice(0,2) != "0x" || !hex.test(tokenAddress.slice(2))) {
        valid = false
        message = "Please enter a valid address. (hexnumber of length 40, starting with 0x)"
    }
    return { valid, message }
}

export function checkTokenID(tokenID: string) : {valid: boolean, message: string} {
    let valid = true
    let message = ""
    if (tokenID == ""){
        valid = false
        message = "Please input the tokenID."
    }
    const tokenIDParsed = parseFloat(tokenID)
    if (Number.isNaN(tokenIDParsed) || tokenIDParsed <= 0 || !Number.isInteger(tokenIDParsed)){
        alert("Please enter a valid ID.")
    } 
    return { valid, message }
}

export function checkAmount(amount: string) : {valid: boolean, message: string} {
    let valid = true
    let message = ""
    if (amount == ""){
        valid = false
        message = "Please input the amount."
    }
    const amountParsed = parseFloat(amount)
    if (Number.isNaN(amountParsed) || amountParsed <= 0 || !Number.isInteger(amountParsed)){
        alert("Please enter a valid ID.")
    } 
    return { valid, message }
}

export function checkRecipientAddress(recipientAddress: string) : {valid: boolean, message: string} {
    let valid = true
    let message = ""

    if (recipientAddress == ""){
        valid = false
        message = "Please input the tokenAddress."
    }

    const hex = /[0-9A-Fa-f]{40}/g;
    if (recipientAddress.slice(0,2) != "0x" || !hex.test(recipientAddress.slice(2))) {
        valid = false
        message = "Please enter a valid address. (hexnumber of length 40, starting with 0x)"
    }
    return { valid, message }
}
export function generateRandomAddress() : string {
    const values = crypto.getRandomValues(new Uint8Array(20));
    const hexString = Array.from(values, byte => byte.toString(16).padStart(2, '0')).join('')
    return '0x' + hexString
}

export function getTokenIDs(account: Account, tokenAddress: string, amount: number) : bigint[] {
    const tokens = <Tokens>account.values.values.get(tokenAddress)!;
    return tokens.value.slice(0, amount);
}

export function makeTokensList(select_tokens: HTMLSelectElement, tokens: [string, Asset][]){
    for (let i = 0; i < tokens.length; i++) {
      const option = document.createElement("option");
      const token = tokens[i];
      option.value = token[0];
      option.text =
        token[0] + " (Amount: " + (<Tokens>token[1]).value.length + ")";
      select_tokens.add(option);
    }
}