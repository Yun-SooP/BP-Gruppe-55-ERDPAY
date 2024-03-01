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

let paid: boolean;

let div_pay: HTMLDivElement;
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
  btn_return.addEventListener("click", closePaymentPopup);

  div_pay = <HTMLDivElement>document.getElementById("pay")!;
}

async function htmlPay(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  advanced?: boolean
) {
  account = await session!.getAccount(session!.address);
  const tokensForPayment = <Tokens>account.values.values.get(tokenAddress);
  if (tokensForPayment == undefined || tokensForPayment.value.length < amount) {
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
  } else {
    div_pay.style.height = "500px";
    const amountToPay = tokensForPayment.value.length;
    const tokenIDs = utils.getTokenIDs(account, tokenAddress, amount);
    div_pay.innerHTML = `
    <h2></h2>
    <h2>Token Address:</h2>
    <div class="token-address-div third-layer-window">${tokenAddress}</div>

    <h2>Amount:</h2>
    <div class="amount-div third-layer-window">To pay: ${amountToPay} Token${
      amountToPay > 1 ? "s" : ""
    } (available: ${amount} Token${amount > 1 ? "s" : ""})</div>

    <h2>token ID${tokenIDs.length > 1 ? "s" : ""}:</h2>
    <div id="tokenIDs">
    </div>

    <h2>To recipient:</h2>
    <div class="recipient-address-div third-layer-window">${recipientAddress}</div>
    
    <form class="transfer-form">
      <div class="transer-form__advanced-transfer">
        <label class="toggle">
          <input type = "checkbox" id = "advancedTransfer"></input>
          <span class="slider round"></span>
        </label>
        <p>advanced payment with ID selection</p>
      </div> 
  
      <button type="button" class="transfer-form__continue-btn">continue to confirmation</button>
      <button type="button" class="return-btn">cancel</button>
    </form>
    `;
    const div_tokenIDs = document.querySelector<HTMLDivElement>("#tokenIDs")!;
    makeTokenIDsSelection(div_tokenIDs, tokenIDs);

    const btn_continue = document.querySelector<HTMLInputElement>(
      ".transfer-form__continue-btn"
    )!;
    const chk_advanced =
      document.querySelector<HTMLInputElement>("#advancedTransfer")!;

    btn_continue.addEventListener("click", () =>
      payContinueButtonEvent(
        chk_advanced.checked,
        tokenAddress,
        amount.toString(),
        recipientAddress
      )
    );

    chk_advanced.addEventListener("click", () => {
      btn_continue.innerText =
        btn_continue.innerText == "continue to confirmation"
          ? "continue to ID selection"
          : "continue to confirmation";
    });

    chk_advanced.checked = advanced ? true : false;
  }
}

function payContinueButtonEvent(
  advanced: boolean,
  tokenAddress: string,
  amount: string,
  recipientAddress: string
) {
  const valid = checkInputsForPay(tokenAddress, amount, recipientAddress);

  if (!valid) {
    return;
  }

  const amountParsed = parseFloat(amount);
  if (advanced) {
    htmlAdvancedPay(tokenAddress, amountParsed, recipientAddress);
  } else {
    const tokenIDs = utils.getTokenIDs(account, tokenAddress, amountParsed);
    htmlPayConfirmation(tokenAddress, amountParsed, recipientAddress, tokenIDs);
  }
}

function checkInputsForPay(
  tokenAddress: string,
  amount: string,
  recipientAddress: string
): boolean {
  let valid = true;
  valid = !utils.checkTokenAddress(
    tokenAddress,
    "errTokenAddress",
    "token-list"
  )
    ? false
    : valid;
  valid = !utils.checkAmount(amount, "errTokenAmount", "tokenAmount")
    ? false
    : valid;
  valid = !utils.checkRecipientAddress(
    recipientAddress,
    "errRecipientAddr",
    "recipientAddr"
  )
    ? false
    : valid;
  const tokens = <Tokens>account.values.values.get(tokenAddress);
  if (parseFloat(amount) > tokens.value.length) {
    const message =
      "The selected token does not have enough tokens available. Please adjust the amount or select another token.";
    utils.displayErrorMessage(message, "errTokenAmount", "tokenAmount");
    valid = false;
  }
  return valid;
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
  btn_return.addEventListener("click", () => new Event("close"));
}

/**
 * Function to display advanced payment, where token IDs are selected by the user.
 * @param tokenAddress Token address for payment.
 * @param amount Amount of tokens to payment.
 * @param recipientAddress Recipient address for payment.
 * @param checkedTokenIDs Optional, token IDs for payment. Filled in if given.
 */
function htmlAdvancedPay(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  checkedTokenIDs?: bigint[]
) {
  div_pay.innerHTML = `

    <h2>Token:</h2>
    <div class="token-address-div third-layer-window">${tokenAddress}</div>
    <h2>To recipient:</h2>
    <div class="recipient-address-div third-layer-window">${recipientAddress}</div>
    <h2>Choose ${amount} token ID${amount > 1 ? "s" : ""} to send</h2>
    <div class= checkboxesIDs id="tokenCheckBox"></div>
    <span id="errTransferConfirm"></span>
    <form class="advanced-transfer-form">
      <button type="button" class="advanced-transfer-form__return-btn">return</button>
      <button type="button" class="advanced-transfer-form__continue-btn">continue</button>
    </form>
  `;
  const availableTokenIDs = (<Tokens>account.values.values.get(tokenAddress))
    .value;
  const div_checkboxesIDs =
    document.querySelector<HTMLDivElement>(".checkboxesIDs")!;
  const checkboxes_IDs =
    typeof checkedTokenIDs == "undefined"
      ? makeTokenIDsCheckboxes(div_checkboxesIDs, availableTokenIDs)
      : makeTokenIDsCheckboxes(
          div_checkboxesIDs,
          availableTokenIDs,
          checkedTokenIDs
        );

  const btn_continue = document.querySelector<HTMLInputElement>(
    ".advanced-transfer-form__continue-btn"
  )!;
  btn_continue.addEventListener("click", () =>
    advancedPayContinueButtonEvent(
      tokenAddress,
      amount,
      recipientAddress,
      checkboxes_IDs!
    )
  );

  const btn_return = document.querySelector<HTMLInputElement>(
    ".advanced-transfer-form__return-btn"
  )!;
  btn_return.addEventListener("click", () =>
    htmlPay(tokenAddress, amount, recipientAddress, true)
  );
}

/**
 * Function to fill token IDs selection. Checkboxes are created.
 * @param div_chkIDs HTML element to fill in the checkboxes.
 * @param availableTokenIDs Available token IDs.
 * @param checkedTokenIDs Optional, token IDs for payment. Filled in if given.
 * @returns chk_IDs List of checkboxes for token IDs.
 */
function makeTokenIDsSelection(
  div_tokenIDs: HTMLDivElement,
  tokenIDs: bigint[]
): bigint[] {
  const selectedTokenIDs: bigint[] = [];
  for (let i = 0; i < tokenIDs.length; i++) {
    const span = document.createElement("span");
    span.classList.add("clickable-token-id", "third-layer-window");
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
    span.addEventListener("click", () => {
      span.classList.add("clicked-clickable-token-id");
    });
    div_tokenIDs.appendChild(span);
  }

  return selectedTokenIDs;
}
/**
 * Function for continue button event in advanced payment.
 * @param tokenAddress Token address for payment.
 * @param amount Amount of tokens to payment.
 * @param recipientAddress Recipient address for payment.
 * @param chk_IDs List of checkboxes for token IDs.
 */
function advancedPayContinueButtonEvent(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  chk_IDs: HTMLInputElement[]
) {
  const chk_checkedIDs = chk_IDs.filter((checkbox) => checkbox.checked);
  if (chk_checkedIDs.length != amount) {
    // alert(
    //   `Please choose ${amount} token ID(s)! (currently ${chk_checkedIDs.length} chosen)`
    // );
    const message = `Please choose ${amount} token ID(s)! (currently ${chk_checkedIDs.length} chosen)`;
    utils.displayErrorMessage(message, "errTransferConfirm", "tokenCheckBox");
    return;
  }
  const tokenIDs = chk_checkedIDs.map((checkbox) => BigInt(checkbox.value));
  htmlPayConfirmation(
    tokenAddress,
    amount,
    recipientAddress,
    tokenIDs,
    chk_IDs
  );
}

/**
 * Function to display payment confirmation.
 * @param tokenAddress Token address for payment.
 * @param amount Amount of tokens to payment.
 * @param recipientAddress Recipient address for payment.
 * @param tokenIDs IDs to payment.
 * @param chk_IDs Optional, list of checkboxes for token IDs.
 */
function htmlPayConfirmation(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  tokenIDs: bigint[],
  chk_IDs?: HTMLInputElement[]
) {
  div_pay.innerHTML = `
    <h2>Please confirm the transfer</h2>
    <h2>${amount} Token${amount > 1 ? "s" : ""} of:</h2>
    <div class="token-address-div third-layer-window">${tokenAddress}</div>
    <h2>token ID${tokenIDs.length > 1 ? "s" : ""}:</h2>
    <div id="tokenIDs">
    </div>

    <h2>To recipient:</h2>
    <div class="recipient-address-div third-layer-window">${recipientAddress}</div>
    
    <form class="confirm-transfer-form">
      <button type="button" class="confirm-transfer-btn">confirm transfer</button>
      <button type="button" class="return-btn">return</button>
    </form>

  `;
  const div_tokenIDs = document.querySelector<HTMLDivElement>("#tokenIDs")!;

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
  const btn_makeTransfer = document.querySelector<HTMLInputElement>(
    ".confirm-transfer-form .confirm-transfer-btn"
  )!;
  btn_makeTransfer.addEventListener("click", () =>
    payEvent(tokenAddress, amount, recipientAddress, tokenIDs)
  );

  const btn_return = document.querySelector<HTMLInputElement>(
    ".confirm-transfer-form .return-btn"
  )!;
  btn_return.addEventListener("click", () =>
    typeof chk_IDs != "undefined"
      ? htmlAdvancedPay(tokenAddress, amount, recipientAddress, tokenIDs)
      : htmlPay(tokenAddress, amount, recipientAddress)
  );
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
