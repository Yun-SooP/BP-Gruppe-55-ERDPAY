import { Session } from "@polycrypt/erdstall";
import { restoreSession } from "./setup_session";
import * as utils from "./utils.ts";
import { Account, Address } from "@polycrypt/erdstall/ledger";
import { Tokens, Assets, Asset } from "@polycrypt/erdstall/ledger/assets";

let popup: HTMLDivElement;
let tokenAddress: string;
let amount: number;
let recipientAddress: string;

let session: Session;
let privateKey: string;
let account: Account;
let tokenIDs: bigint[];

let paid: boolean;
let div_pay: HTMLDivElement;
type BooleanWrapper = {
  value: boolean;
}


export function eventPayPopup(
  tokenAddressToPay: string,
  amountToPay: number,
  recipientAddressToPay: string
): Promise<boolean> {
  tokenAddress = tokenAddressToPay;
  amount = amountToPay;
  recipientAddress = recipientAddressToPay;

  // Create the overlay element
  const overlay = document.createElement("div");
  overlay.id = "paymentOverlay";
  overlay.style.position = "fixed";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";
  overlay.style.overflowY = "auto"; // Enable vertical scrolling on the overlay

  // Create the popup element
  popup = document.createElement("div");
  popup.id = "paymentPopup";
  popup.style.textAlign = "center";
  popup.style.maxHeight = "100%"; // Set a maximum height for the popup
  popup.style.overflowY = "auto"; // Enable vertical scrolling within the popup

  // Append the popup to the overlay, then the overlay to the body
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  paid = false;
  htmlLogin();
  return new Promise((resolve) => {
    document.addEventListener("close", () => {
      closePaymentPopup();
      resolve(paid);
    });
  });
}

// Function to close the popup
function closePaymentPopup() {
  const overlay = document.getElementById("paymentOverlay");
  if (overlay) {
    overlay.remove();
  }
}

function dispatchCloseEvent() {
  document.dispatchEvent(new Event("close"));
}

function htmlLogin() {
  popup.innerHTML = `
      <div class="session-window l-session-window first-layer-window">

        <div class="widget-header">
          <button class="goback-button">
            <i class="fa-solid fa-angle-left"></i>
          </button>
          <img
            class="erdstall-logo"
            src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
            alt="TypeScript"
          />
        </div>
      
        <header class="session-window__header l-session-window__header">
          <h1>Sign-In</h1>
          <p>
            log-in with your private key
          </p>
        </header>

      <form class="session-window__form l-session-window__form">
        <span id="errRestoreSession"></span>
        <input type="password" placeholder="your private key (ex. 0x1234...)" id="inputPrivateKey"/>
        <button type="button" class="restore-session-btn" >Log-in</button>
      </form>
    </div>
  `;

  const btn_login = document.querySelector<HTMLButtonElement>(
    ".session-window__form .restore-session-btn"
    // to fix
  )!;

  const txt_privateKey = document.querySelector<HTMLInputElement>(
    ".session-window__form input[type='password']"
  )!;

  /**
   * Event listeners for going back to the main page
   */

  const btn_return = document.querySelector<HTMLButtonElement>(
    ".session-window .goback-button"
  )!;
  btn_return.addEventListener("click", closePaymentPopup);

  txt_privateKey.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_login.click();
    }
  });

  btn_login.addEventListener("click", () => eventLogin(txt_privateKey.value));
}

async function eventLogin(privateKeyForLogin: string) {
  const restoredSession = await restoreSession(privateKeyForLogin);
  const valid = utils.checkPrivateKey(
    privateKeyForLogin,
    "errRestoreSession",
    "inputPrivateKey"
  );
  if (!valid) {
    return;
  } else if (restoredSession.message != undefined) {
    // there might be unexpected errors (ex. session does not exist)
    utils.displayErrorMessage(
      restoredSession.message,
      "errRestoreSession",
      "inputPrivateKey"
    );
    return;
  }
  session = restoredSession.session!;
  privateKey = privateKeyForLogin;
  htmlFrame();
  htmlPay(tokenAddress, amount, recipientAddress);
}

function htmlFrame() {
  popup.style.height = "130vh";
  popup.innerHTML = `
  <div class="transfer-window-container l-transfer-window-container first-layer-window">

      <div class="widget-header">
          <button class="goback-button">
            <i class="fa-solid fa-angle-left"></i>
          </button>
          <img
            class="erdstall-logo"
            src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
            alt="TypeScript"
          />
      </div>

      <h1 class="l-transfer-title">Pay</h1>
      <div id="pay" class="transfer-window l-transfer-window second-layer-window">
      </div>
  

      <div class="transfer-footer l-transfer-footer">
          <span class="private-key">your private key</span>
          <span class="session-address">your address</span>
      </div>
  </div>
    
  `;

  const btn_privateKey =
    document.querySelector<HTMLButtonElement>(".private-key")!;
  btn_privateKey.addEventListener("click", () => alert(privateKey));

  const btn_sessionAddress =
    document.querySelector<HTMLButtonElement>(".session-address")!;
  btn_sessionAddress.addEventListener("click", () => alert(session!.address));

  // Event listener for going back one page

  const btn_return = document.querySelector<HTMLButtonElement>(
    ".transfer-window-container .goback-button"
  )!;
  btn_return.addEventListener("click", dispatchCloseEvent);

  div_pay = <HTMLDivElement>document.getElementById("pay")!;
}

async function htmlPay(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
) {
  account = await session!.getAccount(session!.address);
  const tokensForPayment = <Tokens>account.values.values.get(tokenAddress);
  if (tokensForPayment == undefined || tokensForPayment.value.length < amount) {
    htmlPayNotPossible(tokensForPayment);
  } else {
    div_pay.style.height = "500px";
    const amountAvailable = tokensForPayment.value.length;
    div_pay.innerHTML = `
      <h2></h2>
      <h2>Token Address:</h2>
      <div class="token-address-div third-layer-window">${tokenAddress}</div>

      <h2>Amount:</h2>
      <div class="amount-div third-layer-window">To pay: ${amount} Token${
        amount > 1 ? "s" : ""
      } (available: ${amountAvailable} Token${amountAvailable > 1 ? "s" : ""})</div>

      <h2 id="token ID label">token ID${amount > 1 ? "s" : ""}:</h2>
      <button type="button" class="changeTokenIDs-btn">change</button>
      <div class="tokenIDs-div third-layer-window"> 
        <div id="tokenIDs">
        </div>
      </div>

      <h2>To recipient:</h2>
      <div class="recipient-address-div third-layer-window">${recipientAddress}</div>
      
      <form class="confirm-transfer-form">
        <button type="button" class="confirm-transfer-btn">confirm transfer</button>
        <button type="button" class="return-btn">cancel</button>
      </form>
      `;
    tokenIDs = utils.getTokenIDs(account, tokenAddress, amount);
    const tokenIDsAvailable = utils.getTokenIDs(account, tokenAddress, amountAvailable);
    const div_tokenIDs = document.querySelector<HTMLDivElement>("#tokenIDs")!;
    makeTokenIDsList(div_tokenIDs, tokenIDs);
    const btn_changeTokenIDs = document.querySelector<HTMLButtonElement>(".changeTokenIDs-btn")!;
    const selecting : BooleanWrapper = { value: false };
    
    btn_changeTokenIDs.addEventListener("click", ()=>changeTokenIDsButtonEvent(
      selecting,tokenIDsAvailable,div_tokenIDs, btn_changeTokenIDs));

    const btn_confirm = document.querySelector<HTMLInputElement>(
      ".confirm-transfer-form .confirm-transfer-btn"
    )!;

    btn_confirm.addEventListener("click", () =>{
      if (selecting.value){
        alert("Please confirm the token ID selection!")
      } else {
        payEvent(tokenAddress,amount,recipientAddress, tokenIDs);
      }
    });

    const btn_cancel = document.querySelector<HTMLInputElement>(
      ".confirm-transfer-form .return-btn"
    )!;
    btn_cancel.addEventListener("click", dispatchCloseEvent);

  }

}
function htmlPayNotPossible(tokensForPayment : Tokens){
  div_pay.style.height = "130px";
    div_pay.innerHTML = `
      <h2>You don't have ${
        tokensForPayment == undefined ? "the" : "enough"
      } tokens required for payment.</h2>
      <form class="successful-transfer-form">
        <button type="button" class="return-btn">close</button>
      </form>
    `;
    const btn_close = document.querySelector<HTMLInputElement>(
      ".successful-transfer-form .return-btn"
    )!;
    btn_close.addEventListener("click", dispatchCloseEvent);
}

function changeTokenIDsButtonEvent(selecting:BooleanWrapper, tokenIDsAvailable:bigint[], div_tokenIDs:HTMLDivElement, btn_changeTokenIDs:HTMLButtonElement){
  if (!selecting.value){
    selecting.value = true;
    btn_changeTokenIDs.innerText = "confirm";
    div_tokenIDs.innerHTML ="";
    tokenIDs = makeTokenIDsSelection(div_tokenIDs, tokenIDsAvailable);
  } else {
    if(tokenIDs.length != amount){
      alert(`Please select ${amount} token ID${amount > 1 ? "s" : ""}!`);
      return;
    }
    selecting.value = false;
    btn_changeTokenIDs.innerText = "change";
    div_tokenIDs.innerHTML ="";
    makeTokenIDsList(div_tokenIDs, tokenIDs);
  }
}

async function payEvent(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  tokenIDs?: bigint[]
) {
  tokenIDs =
    typeof tokenIDs == "undefined"
      ? utils.getTokenIDs(account, tokenAddress, amount)
      : tokenIDs;
  const { status, error } = await payTo(
    session,
    tokenAddress,
    recipientAddress,
    tokenIDs
  );
  if (status == 1) {
    paid = true;
    htmlPaySuccesful();
  } else {
    const err: Error = <Error>error;

    //when does this appear?
    alert("Payment failed!: " + err.message);
  }
}

/**
 * Function to display successful payment.
 */
function htmlPaySuccesful() {
  div_pay.innerHTML = `
    <div class="successful-div third-layer-window">Payment Succesful!</div>
    <form class="successful-transfer-form">
      <button type="button" class="return-btn">close</button>
    </form>
  `;
  const btn_return = document.querySelector<HTMLInputElement>(
    ".successful-transfer-form .return-btn"
  )!;
  btn_return.addEventListener("click", dispatchCloseEvent);
}


function makeTokenIDsSelection(
  div_tokenIDs: HTMLDivElement,
  tokenIDs: bigint[],
): bigint[] {
  const selectedTokenIDs : bigint[] = [];
  for (let i = 0; i < tokenIDs.length; i++) {
    const span = document.createElement("span");
    span.classList.add("token-id", "third-layer-window");
    const tokenIDString = tokenIDs[i] + "";
    const tokenIDTODisplay =
      tokenIDString.length > 6
        ? tokenIDString.substring(0, 3) +
          "..." +
          tokenIDString.substring(
            tokenIDString.length - 3,
            tokenIDString.length
          )
        : tokenIDString;
    span.innerHTML = `${tokenIDTODisplay}`;
    span.addEventListener('click', ()=>{
      if (!span.classList.contains("clicked-clickable-token-id")){
        span.classList.add("clicked-clickable-token-id");
        selectedTokenIDs.push(tokenIDs[i])
      } else{
        span.classList.remove("clicked-clickable-token-id");
        const index = selectedTokenIDs.indexOf(tokenIDs[i]);
        selectedTokenIDs.splice(index, 1);
      }
    });
    div_tokenIDs.appendChild(span);
  }

  return selectedTokenIDs;
}

/**
 * Function to fill token IDs selection. Spans for selections are created.
 * @param div_tokenIDs HTML element to fill in the selection.
 * @param tokenIDs Available token IDs.
 * @param checkedTokenIDs Optional, token IDs for payment. Filled in if given.
 * @returns token id list for selected token IDs.
 */
function makeTokenIDsList(
  div_tokenIDs: HTMLDivElement,
  tokenIDs: bigint[],
): bigint[] {
  const selectedTokenIDs : bigint[] = [];
  for (let i = 0; i < tokenIDs.length; i++) {
    const span = document.createElement("span");
    span.classList.add("token-id", "third-layer-window");
    const tokenIDString = tokenIDs[i] + "";
    const tokenIDTODisplay =
      tokenIDString.length > 6
        ? tokenIDString.substring(0, 3) +
          "..." +
          tokenIDString.substring(
            tokenIDString.length - 3,
            tokenIDString.length
          )
        : tokenIDString;
    span.innerHTML = `${tokenIDTODisplay}`;
    div_tokenIDs.appendChild(span);
  }

  return selectedTokenIDs;
}



/**
 * Function to carry out payment of tokens.
 * @param session Session from which the payment will happen
 * @param token Token to payment
 * @param amount Amount of the token to payment
 * @param address Address to payment to
 * @param tokenIDs optional, IDs of token to payment
 * @returns Status and error message
 */
async function payTo(
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
  tokens.value = tokenIDs;

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
