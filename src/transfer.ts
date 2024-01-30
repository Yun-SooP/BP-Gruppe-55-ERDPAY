import "./style.css";
import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
import { Account } from "@polycrypt/erdstall/ledger";
import { Asset } from "@polycrypt/erdstall/ledger/assets";
import { Assets } from "@polycrypt/erdstall/ledger/assets";
import { newSession, restoreSession } from "./setup_session.ts";
import { Tokens } from "@polycrypt/erdstall/ledger/assets";
import { widget } from "./widget.ts";
import { htmlMint } from "./mint.ts";

let session: Session;
let privateKey: string;
let account: Account;
let div_app: HTMLDivElement;
let div_transfer: HTMLDivElement;

/**
 * Function to display selection between a new session and restoring old session.
 * @param html_widget HTML to display to
 */
export function htmlCreateSessionForTransfer(div_widget: HTMLDivElement) {
  div_app = div_widget;
  div_app.innerHTML = `
      <div class="session-window">
      <img
        class="erdstall-logo"
        src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
        alt="TypeScript"
      />
      <button class="goback-button">
        <i class="fa-solid fa-angle-left"></i>
      </button>
      <header class="session-window__header">
        <h1>Transfer</h1>
        <p>
          Create a new session or<br />
          restore your previous session with your private key
        </p>
      </header>

      <form class="session-window__form">
        <input type="button" value="New Session" />
        <span>or</span>
        <input type="text" placeholder="your private key" />
        <input type="button" value="Restore Session" />
      </form>
    </div>
  `;
  const btn_newSession = document.querySelector<HTMLInputElement>(
    ".session-window__form input[value='New Session']"
  )!;
  const btn_restoreSession = document.querySelector<HTMLInputElement>(
    ".session-window__form input[value='Restore Session']"
    // to fix
  )!;

  const txt_previousPrivateKey = document.querySelector<HTMLInputElement>(
    ".session-window__form input[type=text]"
  )!;

  /**
   * Event listeners for going back to the main page
   */
  const logo_return =
    document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => widget(div_app));

  const btn_return = document.querySelector<HTMLButtonElement>(
    ".session-window .goback-button"
  )!;
  btn_return.addEventListener("click", () => widget(div_app));

  btn_newSession.addEventListener("click", () => eventNewSession());

  btn_restoreSession.addEventListener("click", () => eventRestoreSession(txt_previousPrivateKey.value));
}

async function eventNewSession() {
  const newSession_ = await newSession();
  if (newSession_.message != undefined) {
    alert(newSession_.message)
    return
  }
  session = newSession_.session!;
  privateKey = newSession_.privateKey!;
  htmlTransferAndMintWindow();
}

async function eventRestoreSession(privateKey: string) {
    const restoredSession = await restoreSession(privateKey);
    if (restoredSession.message != undefined) {
      alert(restoredSession.message)
      return
    }
    session = restoredSession.session!;
    htmlTransferAndMintWindow();
}

/**
 * Function to make window for transfer and minting.
 */
export function htmlTransferAndMintWindow() {
  div_app.innerHTML = `
  <div class="transfer-window-container">
      <img
        class="erdstall-logo"
        src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
        alt="TypeScript"
      />
      <button class="goback-button">
        <i class="fa-solid fa-angle-left"></i>
      </button>

      <h1>Transfer</h1>
      <div class="transfer-window">
      </div>

      <h1>Mint</h1>
      <div class="mint-window">
      </div>

      <span class="private-key">your private key</span>
      <span class="session-address">your address</span>
    </div>
    
  `;
  div_transfer = 
    document.querySelector<HTMLDivElement>(".transfer-window-container .transfer-window")!;
  const div_mint = 
  document.querySelector<HTMLDivElement>(".mint-window")!

  const btn_privateKey =
    document.querySelector<HTMLButtonElement>(".private-key")!;
  btn_privateKey.addEventListener("click", () => alert(privateKey));

  const btn_sessionAddress =
    document.querySelector<HTMLButtonElement>(".session-address")!;
  btn_sessionAddress.addEventListener("click", () => alert(session!.address))

  // Event listener for going back one page
  const btn_return = 
    document.querySelector<HTMLButtonElement>( ".transfer-window-container .goback-button")!;
  btn_return.addEventListener("click", () => htmlCreateSessionForTransfer(div_app));

  const logo_return =
    document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => widget(div_app));

  htmlTransfer()
  htmlMint(div_mint, session)
}

export async function htmlTransfer(tokenAddress?: string, amount?: number, recipientAddress?: string, advanced?: boolean){
  account = await session!.getAccount(session!.address);
  if (account.values.values.size == 0) {
    div_transfer.innerHTML = `
      <p>You have no token available.</p>
    `;
    div_transfer.style.height = "70px";
  } else {
    div_transfer.innerHTML = `
      <h2>Choose your token to send</h2>
      <div class="available-tokens-header">
          <span>Available Tokens</span>
          <span>Amount</span>
      </div>
      <select class="token-list" size = "5"></select>
      <form class="transfer-form">
        <input type = "text" class="transfer-form__token-txt_amount" placeholder="Amount of tokens to transfer"/>
        <span>Tokens</span>
        <input type = "checkbox" id = "advancedTransfer">advanced transfer with ID selection</input>
        <input type="text" placeholder="recipient address" />
        <input type="button" value="continue" />
      </form>
    `;
    const select_tokens = document.querySelector<HTMLSelectElement>(".token-list")!;
    const tokens = Array.from(account.values.values.entries());
    const txt_amount = 
      document.querySelector<HTMLInputElement>(".transfer-form__token-txt_amount")!;
    const txt_recipientAddress = 
      document.querySelector<HTMLInputElement>('.transfer-form input[placeholder="recipient address"]')!;
    
    makeTokensList(select_tokens, tokens)
    
    const btn_continue = 
      document.querySelector<HTMLInputElement>('.transfer-form input[value="continue"]')!;
    btn_continue.addEventListener("click", async () => transferContinueButtonEvent(checkbox_advanced.checked, select_tokens.value, txt_amount.value, txt_recipientAddress.value));

    const checkbox_advanced = 
      document.querySelector<HTMLInputElement>("#advancedTransfer")!

    select_tokens.value = typeof tokenAddress == 'undefined' ? "" : tokenAddress
    txt_amount.value = typeof amount == 'undefined' ? "" : `${amount}`
    txt_recipientAddress.value = typeof recipientAddress == 'undefined' ? "" : recipientAddress
    checkbox_advanced.checked = advanced ? true : false
  }
}

function makeTokensList(select_tokens: HTMLSelectElement, tokens: [string, Asset][]){
  for (let i = 0; i < tokens.length; i++) {
    const option = document.createElement("option");
    const token = tokens[i];
    option.value = token[0];
    option.text =
      token[0] + " (Amount: " + (<Tokens>token[1]).value.length + ")";
    select_tokens.add(option);
  }
}

function transferContinueButtonEvent(advanced: boolean, tokenAddress: string, amount: string, recipientAddress: string){
  const { valid, message } = checkInputsForTransfer(tokenAddress, amount, recipientAddress)

  if (!valid) {
    alert(message)
  } else {
    const amountParsed = parseFloat(amount)
    if (advanced){
      htmlAdvancedTransfer(tokenAddress, amountParsed, recipientAddress)
    } else {
      const tokenIDs = getTokenIDsForTransfer(tokenAddress, amountParsed)
      htmlTransferConfirmation(tokenAddress, amountParsed, recipientAddress, tokenIDs)
    }
  }
}

function checkInputsForTransfer(tokenAddress: string, amount: string, recipientAddress: string) : {valid: boolean, message: string} {
  let valid = true
  let message = ""
  if (tokenAddress == "") {
    message = "Please select the address of the token to transfer.";
    valid = false
    return { valid, message }
  } else if (amount == "") {
    message = "Please input the amount of the tokens to transfer."
    valid = false
    return { valid, message }
  } else if (recipientAddress == "") {
    message = "Please input the address of the recipient."
    valid = false
    return { valid, message }
  }
  const amountParsed = parseFloat(amount)
  if (Number.isNaN(amountParsed) || amountParsed <= 0 || !Number.isInteger(amountParsed)) {
    message = "Please enter a valid amount."
    valid = false
    return { valid, message }
  }
  const tokens = <Tokens>account.values.values.get(tokenAddress)
  if (amountParsed > tokens.value.length){
    message = "The selected token does not have enought amount of tokens. Please adjust the amount or select another token."
    valid = false
    return { valid, message }
  }
  return { valid, message }
}

async function transferEvent(tokenAddress: string, amount: number, recipientAddress: string, tokenIDs?: bigint[]){
  tokenIDs = typeof tokenIDs == "undefined" ? getTokenIDsForTransfer(tokenAddress, amount) : tokenIDs
  const { status, error } = await transferTo(
    session,
    tokenAddress,
    recipientAddress,
    tokenIDs
  );
  if (status == 1) {
    htmlTransferSuccesful()
  } else {
    const err: Error = <Error>error;
    alert("Transfer failed!: " + err.message);
  }
}

function htmlTransferSuccesful(){
  div_transfer.innerHTML = `
    <h2>transfer succesful!</h2>
    <form class="transfer-form">
      <input type="button" value="return" />
    </form>
  `
  const btn_return = 
    document.querySelector<HTMLInputElement>( '.transfer-form input[value="return"]')!;
  btn_return.addEventListener("click", () => htmlTransfer())
}

function htmlAdvancedTransfer(tokenAddress: string, amount: number, recipientAddress: string, checkedTokenIDs?: bigint[]){
  div_transfer.innerHTML = `
    <h2>Token: ${tokenAddress}<h2>
    <h2>To: ${recipientAddress}<h2>
    <h2>Choose ${amount} token ID(s) to send</h2>
    <div id= checkboxesIDs></div>
    <form class="transfer-form">
      <input type="button" value="continue" />
      <input type="button" value="return" />
    </form>
  `;
  const availableTokenIDs = (<Tokens>account.values.values.get(tokenAddress)).value;
  const div_checkboxesIDs = document.querySelector<HTMLDivElement>("#checkboxesIDs")!;
  const checkboxes_IDs = typeof checkedTokenIDs == 'undefined' ? 
    makeTokenIDsCheckboxes(div_checkboxesIDs, availableTokenIDs) :
    makeTokenIDsCheckboxes(div_checkboxesIDs, availableTokenIDs, checkedTokenIDs)

  const btn_continue = 
    document.querySelector<HTMLInputElement>( '.transfer-form input[value="continue"]')!;
  btn_continue.addEventListener("click", () => advancedTransferContinueButtonEvent(tokenAddress, amount, recipientAddress, checkboxes_IDs!))
  
  const btn_return = 
    document.querySelector<HTMLInputElement>( '.transfer-form input[value="return"]')!;
  btn_return.addEventListener("click", () => htmlTransfer(tokenAddress, amount, recipientAddress, true))
}

function makeTokenIDsCheckboxes(div_checkboxesIDs: HTMLDivElement, availableTokenIDs:bigint[], checkedTokenIDs?:bigint[]) : HTMLInputElement[]{
  const checkboxes_IDs: HTMLInputElement[] = []
  for (let i = 0; i < availableTokenIDs.length; i++) {
    const tokenID = availableTokenIDs[i]
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.value = `${tokenID}`
    checkbox.id = `${tokenID}`
    checkbox.checked = typeof checkedTokenIDs != 'undefined' && checkedTokenIDs.includes(tokenID) ? true : false
    checkboxes_IDs.push(checkbox)
    const span =document.createElement("span");
    span.innerHTML = `${tokenID} </br>`;
    div_checkboxesIDs.appendChild(checkbox)
    div_checkboxesIDs.appendChild(span)
  }

  return checkboxes_IDs
}



function advancedTransferContinueButtonEvent(tokenAddress: string, amount: number, recipientAddress: string, checkboxes_IDs: HTMLInputElement[]){
  const checkboxes_checkedIDs = checkboxes_IDs.filter(checkbox => checkbox.checked)
  if (checkboxes_checkedIDs.length != amount){
    alert(`Please choose ${amount} token ID(s)! (currently ${checkboxes_checkedIDs.length} chosen)`)
    return
  }
  const tokenIDs = checkboxes_checkedIDs.map(checkbox=>BigInt(checkbox.value))
  htmlTransferConfirmation(tokenAddress, amount, recipientAddress, tokenIDs, checkboxes_IDs)
}

function htmlTransferConfirmation(tokenAddress: string, amount: number, recipientAddress: string, tokenIDs:bigint[], checkboxes_IDs?: HTMLInputElement[]) {
  div_transfer.innerHTML = `
    <h2>Please confirm the transfer</h2>
    <h2>token address: ${tokenAddress}</h2>
    <h2>amount: ${amount}</h2>
    <h2>recipient address: ${recipientAddress}</h2>
    <h2>token ids:<h2>
    <div id= tokenIDs>
    </div>
    <form class="transfer-form">
      <input type="button" value="make transfer" />
      <input type="button" value="return" />
    </form>

  `
  const div_tokenIDs = document.querySelector<HTMLDivElement>("#tokenIDs")!;
  
  for (let i = 0; i < tokenIDs.length; i++){
    const span =document.createElement("span");
    span.innerHTML = `${tokenIDs[i]} </br>`;
    div_tokenIDs.appendChild(span)
  }
  const btn_makeTransfer = 
  document.querySelector<HTMLInputElement>( '.transfer-form input[value="make transfer"]')!;
  btn_makeTransfer.addEventListener("click", () => transferEvent(tokenAddress, amount, recipientAddress, tokenIDs))

  const btn_return = 
    document.querySelector<HTMLInputElement>( '.transfer-form input[value="return"]')!;
  btn_return.addEventListener("click", () => 
    typeof checkboxes_IDs != 'undefined' ? 
    htmlAdvancedTransfer(tokenAddress, amount, recipientAddress, tokenIDs) :
    htmlTransfer(tokenAddress, amount, recipientAddress)
  )
}


/**
 * Function to carry out transfer of tokens.
 * @param session Session from which the transfer will happen
 * @param token Token to transfer
 * @param amount Amount of the token to transfer
 * @param address Address to transfer to
 * @param tokenIDs optional, IDs of token to transfer
 * @returns Status and error message
 */
async function transferTo(
  session: Session,
  tokenAddress: string,
  recipientAddress: string,
  tokenIDs: bigint[]
) {
  let transaction;
  let receipt;
  let status;
  let error;

  const tokens = <Tokens>account.values.values.get(tokenAddress)!;

  tokens.value = tokenIDs
  
  const asset = <Asset>tokens;
  const assets_transfer = new Assets({ token: tokenAddress, asset: asset });

  try {
    transaction = await session.transferTo(
      assets_transfer,
      Address.fromString(recipientAddress)
    );
    receipt = await transaction.receipt;
    status = receipt.status;
    error = receipt.error;
  } catch (err) {
    status = 0;
    error = err;
  }
  return { status, error };
}

function getTokenIDsForTransfer(tokenAddress: string, amount: number) : bigint[] {
  const tokens = <Tokens>account.values.values.get(tokenAddress)!;
  return tokens.value.slice(0, amount);
}