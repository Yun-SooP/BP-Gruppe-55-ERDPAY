import { Session } from "@polycrypt/erdstall";
import { restoreSession } from "./setup_session";
import * as utils from "./utils";
import { Account, Address } from "@polycrypt/erdstall/ledger";
import { Tokens, Assets, Asset } from "@polycrypt/erdstall/ledger/assets";
import "./style.css"

let popup: HTMLDivElement;
let tokenAddress: string;
let amountToPay: number;
let recipientAddress: string;

let session: Session;
let privateKey: string;
let account: Account;
let tokenIDs: bigint[];
let newTokenIDs: bigint[];
let btn_cancelChangeTokenIDs: HTMLButtonElement;

let paid: boolean;
let div_pay: HTMLDivElement;
type BooleanWrapper = {
  value: boolean;
};

/**
 * Triggers a popup for processing a payment.
 * Returns a promise that resolves to a boolean value indicating the payment success status:
 * `true` for a successful payment, `false` otherwise.
 * @param tokenAddressToPay The address of the token to use for payment.
 * @param amount The amount of the token to pay.
 * @param recipientAddressToPay The address of the payment recipient.
 * @returns A promise that resolves to a boolean indicating the payment
 */
export function eventPayPopup(
  tokenAddressToPay: string,
  amount: number,
  recipientAddressToPay: string
): Promise<boolean> {
  tokenAddress = tokenAddressToPay;
  amountToPay = amount;
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
      closePaymentPopup(); // Function to close the popup (assumed to be defined elsewhere)
      resolve(paid); // `paid` variable should hold the payment status (true or false)
    });
  });

  /**
   * Closes the payment popup overlay.
   * Designed to be used internally within the `eventPayPopup` function to ensure the popup is not closed
   * without resolving the associated promise.
   * External functions should use `dispatchCloseEvent` to trigger the closing of the popup.
   */
  function closePaymentPopup() {
    const overlay = document.getElementById("paymentOverlay");
    if (overlay) {
      overlay.remove();
    }
  }
}

/**
 * Dispatches a 'close' event to signal the intention to close the payment popup.
 * This function should be used by external components that need to close the popup,
 * ensuring that the closing process is managed correctly and any associated cleanup is performed.
 */
function dispatchCloseEvent() {
  document.dispatchEvent(new Event("close"));
}

/**
 * Populates the popup with a sign-in form and sets up the necessary event listeners.
 * The form includes an input field for a private key and a login button.
 */
function htmlLogin() {
  popup.innerHTML = `
      <div class="session-window l-session-window first-layer-window">

        <div class="widget-header">
          <button class="goback-button">
            x
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

  const btn_return = document.querySelector<HTMLButtonElement>(
    ".session-window .goback-button"
  )!;
  btn_return.addEventListener("click", dispatchCloseEvent);

  txt_privateKey.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_login.click();
    }
  });

  btn_login.addEventListener("click", () => eventLogin(txt_privateKey.value));
}

/**
 * Event to log in a user using a provided private key.
 * Validates the private key and restores the user's session if it's valid.
 * Displays an error message if the key is invalid or if the session restoration fails.
 * On successful login, it proceeds to render the payment interface.
 *
 * @param privateKeyForLogin The private key to use for logging into the session.
 */
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
  htmlPay(tokenAddress, amountToPay, recipientAddress);
}

/**
 * Renders the payment frame within the popup and sets up the interactive elements.
 */
function htmlFrame() {
  // popup.style.height = "130vh";
  popup.innerHTML = `
  <div class="transfer-window-container l-pay-window-container first-layer-window">

      <div class="widget-header">
          <button class="goback-button">
            x
          </button>
          <img
            class="erdstall-logo"
            src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
            alt="TypeScript"
          />
      </div>

      <h1 class="l-transfer-title">Pay</h1>
      <div id="pay" class="transfer-window l-pay-window second-layer-window">
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

/**
 * Populates the payment area with transaction details and sets up payment actions.
 * It checks if the user has sufficient tokens for the payment and displays the payment form or an error message.
 * Event listeners are added to handle token ID changes and confirm or cancel the transfer.
 *
 * @param tokenAddress The token address to use for payment.
 * @param amount The amount of tokens to pay.
 * @param recipientAddress The recipient address for the transaction.
 */
async function htmlPay(
  tokenAddress: string,
  amount: number,
  recipientAddress: string
) {
  account = await session!.getAccount(session!.address);
  const tokensForPayment = <Tokens>account.values.values.get(tokenAddress);
  if (tokensForPayment == undefined || tokensForPayment.value.length < amount) {
    htmlPayNotPossible(tokensForPayment);
  } else {
    const amountAvailable = tokensForPayment.value.length;
    div_pay.innerHTML = `
      <h2></h2>
      <h2>Token Address:</h2>
      <div class="token-address-div third-layer-window">${tokenAddress}</div>

      <h2>Amount:</h2>
      <div class="amount-div third-layer-window">To pay: ${amount} Token${
      amount > 1 ? "s" : ""
    } (available: ${amountAvailable} Token${
      amountAvailable > 1 ? "s" : ""
    })</div>
      <div class="pay__tokenID-header">
        <h2 id="token ID label">token ID${amount > 1 ? "s" : ""}:</h2>
        <div id="changeTokenIDs">
          <button type="button" class="changeTokenIDs-btn">edit</button>
        </div>
      </div>
      
      <div id="tokenIDs">
      </div>
      <span id = errTokenIDs> </span>
      

      <h2>To recipient:</h2>
      <div class="recipient-address-div third-layer-window">${recipientAddress}</div>
      
      <form class="confirm-transfer-form">
        <button type="button" class="confirm-transfer-btn">confirm transfer</button>
        <button type="button" class="return-btn">cancel</button>
      </form>
      `;
    tokenIDs = utils.getTokenIDs(account, tokenAddress, amount);
    const tokenIDsAvailable = utils.getTokenIDs(
      account,
      tokenAddress,
      amountAvailable
    );
    const div_tokenIDs = document.querySelector<HTMLDivElement>("#tokenIDs")!;
    makeTokenIDsList(div_tokenIDs, tokenIDs);
    const btn_changeTokenIDs = document.querySelector<HTMLButtonElement>(
      ".changeTokenIDs-btn"
    )!;
    const selecting: BooleanWrapper = { value: false };

    btn_changeTokenIDs.addEventListener("click", () =>
      changeTokenIDsButtonEvent(
        selecting,
        tokenIDsAvailable,
        div_tokenIDs,
        btn_changeTokenIDs
      )
    );

    const btn_confirm = document.querySelector<HTMLInputElement>(
      ".confirm-transfer-form .confirm-transfer-btn"
    )!;

    btn_confirm.addEventListener("click", () => {
      if (selecting.value) {
        alert("Please confirm the token ID selection!");
      } else {
        payEvent(tokenAddress, amount, recipientAddress, tokenIDs);
      }
    });

    const btn_cancel = document.querySelector<HTMLInputElement>(
      ".confirm-transfer-form .return-btn"
    )!;
    btn_cancel.addEventListener("click", dispatchCloseEvent);
  }
}

/**
 * Displays a message in the payment area indicating that the payment cannot proceed.
 * The message varies depending on whether the user has no tokens or an insufficient amount.
 *
 * @param tokensForPayment The Tokens object representing the user's current token balance.
 */
function htmlPayNotPossible(tokensForPayment: Tokens) {
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

/**
 * Initializes an event on the given 'Change Token IDs' button to enable the selection of new token IDs for payment.
 * When the button event is triggered, it toggles the form state between selection and confirmation modes.
 * In selection mode, a form is presented to the user to choose new token IDs from available options.
 * @param selecting A wrapper object for a boolean flag indicating if the selection mode is active.
 * @param tokenIDsAvailable An array of available token IDs for selection.
 * @param div_tokenIDs The container element where the token IDs selection form is rendered.
 * @param btn_changeTokenIDs The button element that toggles the selection mode.
 * @returns
 */
function changeTokenIDsButtonEvent(
  selecting: BooleanWrapper,
  tokenIDsAvailable: bigint[],
  div_tokenIDs: HTMLDivElement,
  btn_changeTokenIDs: HTMLButtonElement
) {
  if (!selecting.value) {
    selecting.value = true;
    btn_changeTokenIDs.innerText = "confirm";
    const div_changeTokenIDs = document.getElementById("changeTokenIDs");
    btn_cancelChangeTokenIDs = document.createElement("button");
    btn_cancelChangeTokenIDs.innerText = "cancel";
    btn_cancelChangeTokenIDs.addEventListener("click", () => {
      selecting.value = false;
      btn_changeTokenIDs.innerText = "edit";
      div_tokenIDs.innerHTML = "";
      utils.resetErrorDisplay("errTokenIDs", "tokenIDs");
      makeTokenIDsList(div_tokenIDs, tokenIDs);
      btn_cancelChangeTokenIDs.remove();
    });
    div_changeTokenIDs?.appendChild(btn_cancelChangeTokenIDs);
    div_tokenIDs.innerHTML = "";
    newTokenIDs = makeTokenIDsSelection(div_tokenIDs, tokenIDsAvailable);
  } else {
    if (newTokenIDs.length != amountToPay) {
      const message =`Please select ${amountToPay} token ID${amountToPay > 1 ? "s" : ""}!`;
      utils.displayErrorMessage(message, "errTokenIDs", "tokenIDs");
      return;
    } else {
      utils.resetErrorDisplay("errTokenIDs", "tokenIDs");
    }
    selecting.value = false;
    btn_changeTokenIDs.innerText = "edit";
    div_tokenIDs.innerHTML = "";
    newTokenIDs.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    tokenIDs = newTokenIDs;
    makeTokenIDsList(div_tokenIDs, newTokenIDs);
    btn_cancelChangeTokenIDs!.remove();
  }
}

/**
 * Populates a given div element with a list of token IDs.
 * Each token ID is displayed in a truncated format for better readability.
 *
 * @param div_tokenIDs The HTMLDivElement where the token IDs will be displayed.
 * @param tokenIDs An array of token IDs to display.
 * @returns
 */
function makeTokenIDsList(div_tokenIDs: HTMLDivElement, tokenIDs: bigint[]) {
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
}

/**
 * Creates a clickable list of token IDs for the user to select from for the payment.
 * Each token ID is truncated for display and can be selected or deselected, updating the array of selected token IDs.
 *
 * @param div_tokenIDs The HTMLDivElement that will contain the list of token IDs.
 * @param tokenIDs An array of token IDs that the user can select from.
 * @returns An array of the selected token IDs.
 */
function makeTokenIDsSelection(
  div_tokenIDs: HTMLDivElement,
  tokenIDs: bigint[]
): bigint[] {
  const selectedTokenIDs: bigint[] = [];
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
    span.addEventListener("click", () => {
      if (!span.classList.contains("clicked-clickable-token-id")) {
        span.classList.add("clicked-clickable-token-id");
        selectedTokenIDs.push(tokenIDs[i]);
      } else {
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
 * Handles the event for the 'change token IDs' button click.
 * Toggles the user's ability to select token IDs for the payment and updates the button text accordingly.
 * It also validates the number of selected token IDs against the required payment amount.
 *
 * @param selecting A BooleanWrapper object indicating if the token ID selection mode is active.
 * @param tokenIDsAvailable An array of available token IDs for selection.
 * @param div_tokenIDs The HTMLDivElement where token IDs are displayed and selected.
 * @param btn_changeTokenIDs The button element that toggles the token ID selection mode.
 */
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
 * Updates the payment area with a success message and a close button after a successful payment.
 * It defines the success message and sets up an event listener on the close button to allow the user to exit the payment interface.
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

/**
 * Initiates a transfer of specified token IDs to a recipient address.
 * Attempts the transfer through the given session and returns the transaction status and any errors.
 *
 * @param session An established session.
 * @param tokenAddress The address of the token to be transferred.
 * @param recipientAddress The address of the recipient receiving the tokens.
 * @param tokenIDs An array of token IDs to transfer.
 * @returns An object containing the status of the transaction and any error that occurred.
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
