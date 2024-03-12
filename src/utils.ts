import { Account } from "@polycrypt/erdstall/ledger"
import { Tokens } from "@polycrypt/erdstall/ledger/assets"
import { Asset } from "@polycrypt/erdstall/ledger/assets"


const errorRed = '#ff7979';

/**
 * Function to check if the token address is valid.
 * A valid token address must start with '0x' followed by 40 hexadecimal characters.
 * @param tokenAddress The token address to validate.
 * @param errDisplay The element ID where the error message should be displayed.
 * @param inputBox The input element ID that receives focus on error.
 * @returns {boolean} True if the address is valid; false otherwise.
 */
export function checkTokenAddress(tokenAddress: string, errDisplay: string, inputBox: string) : boolean {
    resetErrorDisplay(errDisplay, inputBox);

    if (tokenAddress == ""){
        displayErrorMessage("Please enter a token address.", errDisplay, inputBox);
        return false;
    }
    const hex = /[0-9A-Fa-f]{40}/g;
    if (tokenAddress.slice(0,2) != "0x" || !hex.test(tokenAddress.slice(2)) ||tokenAddress.length > 42) {
        displayErrorMessage("Please enter a valid address. (Hexadecimal of length 40, starting with 0x)", errDisplay, inputBox);
        return false;
    }
    return true;
}

/**
 * Function to check if the account address for balance check is valid.
 * A valid account address must start with '0x' followed by 40 hexadecimal characters.
 * @param address The account address to validate.
 * @param errDisplay The element ID where the error message should be displayed.
 * @param inputBox The input element ID that receives focus on error.
 * @returns {boolean} True if the address is valid; false otherwise.
 */
export function checkBalanceAddress(address: string, errDisplay: string, inputBox: string) : boolean {
    resetErrorDisplay(errDisplay, inputBox);

    if (address == ""){
        displayErrorMessage("Please enter a token address.", errDisplay, inputBox);
        return false;
    }
    const hex = /[0-9A-Fa-f]{40}/g;
    if (address.slice(0,2) != "0x" || !hex.test(address.slice(2)) ||address.length > 42) {
        displayErrorMessage("Please enter a valid address. (Hexadecimal of length 40, starting with 0x)", errDisplay, inputBox);
        return false;
    }
    return true;
}

/**
 * 
 * @param tokenAddress 
 * @param errDisplay 
 * @param inputBox 
 * @returns 
 */
export function checkTokenAddressSelected(tokenAddress: string, errDisplay: string, inputBox: string) : boolean {
    resetErrorDisplay(errDisplay, inputBox);

    if (tokenAddress == ""){
        displayErrorMessage("Please select a token address.", errDisplay, inputBox);
        return false;
    }
    
    return true;
}

/**
 * Checks if the given private key is valid.
 * A valid private key must start with '0x' followed by 64 hexadecimal characters.
 * @param privateKey - The private key to validate.
 * @param errDisplay - The element ID where the error message should be displayed.
 * @param inputBox - The input element ID that receives focus on error.
 * @returns {boolean} - True if the key is valid; false otherwise.
 */
export function checkPrivateKey(privateKey: string, errDisplay: string, inputBox: string) : boolean {
    resetErrorDisplay(errDisplay, inputBox);

    if (privateKey == ""){
        displayErrorMessage("Please enter your private key.", errDisplay, inputBox);
        return false;
    }
    const hex = /[0-9A-Fa-f]{64}/g;
    if (privateKey.slice(0,2) != "0x" || !hex.test(privateKey.slice(2))) {
        displayErrorMessage(`Please enter a valid private key. <br> The private key must be in hexadecimal and 64 characters long.`, errDisplay, inputBox);
        return false;
    }
    return true;
}

/**
 * Checks if the given token ID is valid.
 * A valid token ID must be a positive integer without any special characters.
 * @param tokenID - The token ID to validate.
 * @param errDisplay - The element ID where the error message should be displayed.
 * @param inputBox - The input element ID that receives focus on error.
 * @returns {boolean} - True if the token ID is valid; false otherwise.
 */
export function checkTokenID(tokenID: string, errDisplay: string, inputBox: string) : boolean {
    resetErrorDisplay(errDisplay, inputBox);

    if (tokenID == ""){
        displayErrorMessage("Please input the token ID.", errDisplay, inputBox);
        return false;
    }
    const specialCharacters = /^[0-9]+$/;
    if(!specialCharacters.test(tokenID)) {
        displayErrorMessage("Please enter a valid ID. Special characters are not allowed.", errDisplay, inputBox);
        return false;
    }
    return true;
}

/**
 * Checks if the given amount is a valid number greater than zero and an integer.
 * @param amount - The amount to validate.
 * @param errDisplay - The element ID where the error message should be displayed.
 * @param inputBox - The input element ID that receives focus on error.
 * @returns {boolean} - True if the amount is valid; false otherwise.
 */
export function checkAmount(amount: string, errDisplay: string, inputBox: string) : boolean {
    resetErrorDisplay(errDisplay, inputBox);

    if (amount == ""){
        displayErrorMessage("Please input the amount of tokens.", errDisplay, inputBox);
        return false;
    }

    const specialCharacters = /^[0-9]+$/;
    if (!specialCharacters.test(amount)){
        displayErrorMessage("Please enter a number.", errDisplay, inputBox);
        return false;
    }
    return true;
}

/**
 * Checks if the given recipient address is valid.
 * A valid recipient address must start with '0x' followed by 40 hexadecimal characters.
 * @param recipientAddress - The recipient address to validate.
 * @param errDisplay - The element ID where the error message should be displayed.
 * @param inputBox - The input element ID that receives focus on error.
 * @returns {boolean} - True if the address is valid; false otherwise.
 */
export function checkRecipientAddress(recipientAddress: string, errDisplay: string, inputBox: string) : boolean {
    resetErrorDisplay(errDisplay, inputBox);

    if (recipientAddress == ""){
        displayErrorMessage("Please input the recipient address.", errDisplay, inputBox);
        return false;
    }

    const hex = /[0-9A-Fa-f]{40}/g;
    if (recipientAddress.slice(0,2) != "0x" || !hex.test(recipientAddress.slice(2))) {
        displayErrorMessage("Please enter a valid address. (Hexadecimal of length 40, starting with 0x)", errDisplay, inputBox);
        return false;
    }
    return true;
}

/**
 * Generates a random address following the Ethereum address format.
 * The address starts with '0x' followed by 40 random hexadecimal characters.
 * @returns {string} - The generated random address.
 */
export function generateRandomAddress() : string {
    const values = crypto.getRandomValues(new Uint8Array(20));
    const hexString = Array.from(values, byte => byte.toString(16).padStart(2, '0')).join('')
    return '0x' + hexString
}

/**
 * Generates a random token ID in a bigint format.
 * The ID is a 256-bit number represented as a hexadecimal string converted to bigint.
 * @returns {bigint} - The generated random token ID.
 */
export function generateRandomTokenID() : bigint {
    const randomBytesArray = crypto.getRandomValues(new Uint8Array(32));
    const tokenID = BigInt('0x' + Array.from(randomBytesArray).map(byte => byte.toString(16).padStart(2, '0')).join(''));
    return tokenID
}

/**
 * Retrieves token IDs from an account for a given token address.
 * If an amount is specified, returns that many token IDs; otherwise, returns all token IDs.
 * @param account - The account to retrieve token IDs from.
 * @param tokenAddress - The address of the token.
 * @param amount - Optional. The number of token IDs to retrieve.
 * @returns {bigint[]} - An array of token IDs.
 */
export function getTokenIDs(account: Account, tokenAddress: string, amount?: number) : bigint[] {
    const tokens = <Tokens>account.values.values.get(tokenAddress)!;
    if (amount == undefined) return tokens.value
    return tokens.value.slice(0, amount);
}

/**
 * Populates the token and amount select elements with options based on the available tokens.
 * @param select_tokens - The select element for choosing tokens.
 * @param select_amount - The select element for choosing the amount.
 * @param tokens - An array of token information tuples [token address, asset].
 */
export function makeTokensList(select_tokens: HTMLSelectElement, select_amount: HTMLSelectElement, tokens: [string, Asset][]){
    tokens.sort((t1, t2)=> Number(t1[0]) - Number(t2[0]))
    for (let i = 0; i < tokens.length; i++) {
      const option = document.createElement("option");
      const token = tokens[i];
      option.value = token[0];
      option.text = token[0].substring(0,6) + "..." + token[0].substring(38,42)
      select_tokens.add(option);

      const option_amount = document.createElement("option");
        option_amount.value = token[0];
        option_amount.text = (<Tokens>token[1]).value.length + "";
        select_amount.add(option_amount);
    }
}

/**
 * Applies a red border style to the element with the given ID to highlight it as an error field.
 * @param id - The ID of the element to which the red border should be applied.
 */
export function errorHighlight(id :string) {
    document.getElementById(id)!.style.border = "1px solid " + errorRed;
}

/**
 * Removes the red border style from the element with the given ID, typically used after the error is resolved.
 * @param id - The ID of the element from which the red border should be removed.
 */
export function errorRemoveHighlight(id: string) {
    document.getElementById(id)!.style.border = "none";
}

/**
 * Inserts an HTML span element with an error message into the element with the given ID.
 * @param id - The ID of the element where the error message span will be inserted.
 * @param msg - The error message to be displayed, formatted as an HTML string.
 */
export function errorMessageSpan(id:string, msg:string) {
    const errorMsg = document.getElementById(id);
    errorMsg!.innerHTML = msg;
  }

/**
 * Displays an error message with a red font color inside a span element and highlights the associated input box.
 * @param message - The error message to be displayed.
 * @param errDisplay - The ID of the span element where the error message will be displayed.
 * @param inputBox - The ID of the input box element that will be highlighted.
 */
export function displayErrorMessage(message:unknown|string, errDisplay:string, inputBox:string){

    //set error displays
    const msg = 
    `
    <span class="error-message-span">
      <font color= ${errorRed}>
        ${message}
      </font>
    </span>
    `
    errorMessageSpan(errDisplay, msg);
    errorHighlight(inputBox);
  }

/**
 * Adjusts the height of the element with the given ID or the HTMLDivElement itself.
 * @param id - The ID of the HTML element or the HTMLDivElement to be resized.
 * @param pixel - The new height in pixels for the element.
 */
export function setWindowHeight(id:string|HTMLDivElement, pixel:number){
    if ( typeof id === "string"){
        document.getElementById(id)!.style.height = `${pixel}px`;
    } else{
        id.style.height = `${pixel}px`;
    }
    
}

/**
 * Clears any displayed error message and removes the red highlight from the input box.
 * @param errDisplay - The ID of the span element where the error message is displayed.
 * @param inputBox - The ID of the input box element that was highlighted.
 */
export function resetErrorDisplay(errDisplay:string, inputBox:string){
    const msg = "";
    errorMessageSpan(errDisplay, msg);
    errorRemoveHighlight(inputBox);
}



/**
 * This method is used to show only the first and last n characters of long addresses or private keys that are in hexadecimal format.
 * @param str The string that should be shortened
 * @param shownNumber The number of characters from the beginning and the end of a string that should be displayed
 * @returns The input string shortened to "0x" + the first n characters of the input string and the last n characters of the input string
 */
export function shortenString(str: string, showNumber:number){
    const newString = str;
    const bound = showNumber + 2
    const tokenIDTODisplay =
      newString.length > 6
        ? newString.substring(0, bound) +
          "..." +
          newString.substring(
            newString.length - showNumber,
            newString.length
          )
        : newString;

    return tokenIDTODisplay
}

/**
 * This functions adds an event listener to a HTML element which copies the input text to the clipboard of the user on click
 * @param text The text that should be copied to the clipboard
 * @param element the HTML element the event listener should be added to
 */
export function copyToClipboard(text:string, element:HTMLElement) {
    element.addEventListener("click", () => {
        navigator.clipboard.writeText(text);
    });

export function loadingStart(html_div: HTMLDivElement){
    

    var header = html_div.querySelector(".widget-header")
    header?.classList.add("hide");
    var title = html_div.querySelector("#current-tab-label")
    title?.classList.add("hide");
    var tab = html_div.querySelector("#current-tab")
    tab?.classList.add("hide");
    var footer = html_div.querySelector(".transfer-footer")
    footer?.classList.add("hide");

    setLoadingScreen(html_div);
}
export function loadingEnd(html_div: HTMLDivElement){
    removeLoadingScreen(html_div);

    var header = html_div.querySelector(".widget-header")
    header?.classList.remove("hide");
    var title = html_div.querySelector("#current-tab-label")
    title?.classList.remove("hide");
    var tab = html_div.querySelector("#current-tab")
    tab?.classList.remove("hide");
    var footer = html_div.querySelector(".transfer-footer")
    footer?.classList.remove("hide");
}
function setLoadingScreen(loading_div: HTMLDivElement){
    
    let loadingDiv = loading_div.querySelector("#loading");
    if (loadingDiv != null) {
        loadingDiv.innerHTML = `
        <div id="loading" class="l-center">
            <div class="loading">
                <h1> Generating Tokens... please wait</h1>
                <div id="token-counter" class></div>
                <p> Please do not leave this page. You will be redirected soon.</p>
            </div>
        </div>
        `
    }
}
    
function removeLoadingScreen(loading_div: HTMLDivElement){
    let loadingDiv = loading_div.querySelector("#loading");
    if (loadingDiv != null) {
        loadingDiv.innerHTML =""
    }

}