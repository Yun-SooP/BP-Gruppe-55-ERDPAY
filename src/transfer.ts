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
          <h1>Transfer</h1>
          <p>
            Create a new session or<br />
            restore your previous session with your private key
          </p>
        </header>

      <form class="session-window__form l-session-window__form">
        <button type="button" class="new-session-btn">New Session</button>
        <span>or</span>
        <input type="password" placeholder="your private key" />
        <button type="button" class="restore-session-btn">Restore Session</button>
      </form>
    </div>
  `;
  const btn_newSession = document.querySelector<HTMLButtonElement>(
    ".session-window__form .new-session-btn"
  )!;
  const btn_restoreSession = document.querySelector<HTMLButtonElement>(
    ".session-window__form .restore-session-btn"
    // to fix
  )!;

  const txt_previousPrivateKey = document.querySelector<HTMLInputElement>(
    ".session-window__form input[type='password']"
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

  txt_previousPrivateKey.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_restoreSession.click();
    }
  });

  //stretch window and password input, if click password input
  // txt_previousPrivateKey.addEventListener("click", () => {
  //   div_sessionWindow.style.width = "550px";
  //   txt_previousPrivateKey.style.width = "380px";
  // });

  btn_restoreSession.addEventListener("click", () =>
    eventRestoreSession(txt_previousPrivateKey.value)
  );
}

/**
 * Function for new session event.
 */
async function eventNewSession() {
  const newSession_ = await newSession();
  if (newSession_.message != undefined) {
    alert(newSession_.message);
    return;
  }
  session = newSession_.session!;
  privateKey = newSession_.privateKey!;
  htmlTransferAndMintWindow();
}

/**
 * Function for restore session event.
 * @param privateKey Private key to restore the session.
 */
async function eventRestoreSession(privateKey: string) {
  const restoredSession = await restoreSession(privateKey);
  if (restoredSession.message != undefined) {
    alert(restoredSession.message);
    return;
  }
  session = restoredSession.session!;
  htmlTransferAndMintWindow();
}

/**
 * Function to make window for transfer and minting.
 */

export function htmlTransferAndMintWindow() {
  div_app.style.height = "130vh";
  div_app.innerHTML = `
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

      <h1 class="l-transfer-title">Transfer</h1>

      <div class="transfer-window l-transfer-window second-layer-window">
      </div>

      <h1 class="l-transfer-title">Mint</h1>
      <div class="mint-window l-mint-window second-layer-window">
      </div>
        <div class="transfer-footer l-transfer-footer">
          <span class="private-key">your private key</span>
          <span class="session-address">your address</span>
        </div>
    </div>
    
  `;
  div_transfer = document.querySelector<HTMLDivElement>(
    ".transfer-window-container .transfer-window"
  )!;
  const div_mint = document.querySelector<HTMLDivElement>(".mint-window")!;

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
  btn_return.addEventListener("click", () => {
    div_app.style.height = "100vh";
    htmlCreateSessionForTransfer(div_app);
  });

  const logo_return =
    document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => {
    div_app.style.height = "100vh";
    widget(div_app);
  });

  /*const btn_mint = document.querySelector<HTMLInputElement>(
    '.mint-form input[value="mint new token"]'
  )!; */

  htmlTransfer();
  htmlMint(div_mint, session);
}

/**
 * Function to display transfer functionality.
 * Optional paramters fill out inputs in beforehand.
 * @param tokenAddress Optional, token address for transfer.
 * @param amount Optional, amount of tokens to transfer.
 * @param recipientAddress Optional, recipient address for transfer.
 * @param advanced Optional, selection of advanced transfer functionality.
 */
export async function htmlTransfer(
  tokenAddress?: string,
  amount?: number,
  recipientAddress?: string,
  advanced?: boolean
) {
  account = await session!.getAccount(session!.address);
  if (account.values.values.size == 0) {
    div_transfer.innerHTML = `
      <p>You have no token available.</p>
    `;
  } else {
    div_transfer.style.height = "500px";
    div_transfer.innerHTML = `
      <h2>Choose your token and the amount of tokens you want to send</h2>
      <header class="token-list-header">
          <span>Available Tokens</span>
          <span>amount</span>
      </header>

      <div class="token-list">
          <select class="token-list__tokens" size = "5"></select>
          <select class="token-list__amount" disabled size = "5"></select>
      </div>


      <form class="transfer-form">
         <div class="transfer-form__token-amount">
              <input type = "text" placeholder="amount" spellcheck="false"/>
              <span>Tokens</span>
        </div>

        <div class="transer-form__advanced-transfer">
          <label class="toggle">
            <input type = "checkbox" id = "advancedTransfer"></input>
            <span class="slider round"></span>
          </label>
          <p>advanced transfer with ID selection</p>
        </div> 

        <input type="text" class="transfer-form__recipient-address" placeholder="recipient address" spellcheck="false"/>
        <button type="button" class="transfer-form__continue-btn">continue to confirmation</button>
      </form>
    `;
    const select_tokens = document.querySelector<HTMLSelectElement>(
      ".token-list__tokens"
    )!;

    const select_amount = document.querySelector<HTMLSelectElement>(
      ".token-list__amount"
    )!;

    //Synchronize scroll of select_tokens and select_amount
    let isSyncingLeftScroll = false;
    let isSyncingRightScroll = false;

    select_tokens.onscroll = function () {
      if (!isSyncingLeftScroll) {
        isSyncingRightScroll = true;
        select_amount.scrollTop = select_tokens.scrollTop;
      }
      isSyncingLeftScroll = false;
    };

    select_amount.onscroll = function () {
      if (!isSyncingRightScroll) {
        isSyncingLeftScroll = true;
        select_tokens.scrollTop = select_amount.scrollTop;
      }
      isSyncingRightScroll = false;
    };

    const tokens = Array.from(account.values.values.entries());

    const txt_amount = document.querySelector<HTMLInputElement>(
      ".transfer-form__token-amount input"
    )!;
    const txt_recipientAddress = document.querySelector<HTMLInputElement>(
      '.transfer-form input[placeholder="recipient address"]'
    )!;

    makeTokensList(select_tokens, select_amount, tokens);

    const btn_continue = document.querySelector<HTMLInputElement>(
      ".transfer-form__continue-btn"
    )!;
    btn_continue.addEventListener("click", async () =>
      transferContinueButtonEvent(
        chk_advanced.checked,
        select_tokens.value,
        txt_amount.value,
        txt_recipientAddress.value
      )
    );

    const chk_advanced =
      document.querySelector<HTMLInputElement>("#advancedTransfer")!;

    chk_advanced.addEventListener("click", async () => {
      if (btn_continue.value == "continue to confirmation") {
        btn_continue.value = "continue to ID selection";
      } else {
        btn_continue.value = "continue to confirmation";
      }
    });

    select_tokens.value =
      typeof tokenAddress == "undefined" ? "" : tokenAddress;
    txt_amount.value = typeof amount == "undefined" ? "" : `${amount}`;
    txt_recipientAddress.value =
      typeof recipientAddress == "undefined" ? "" : recipientAddress;
    chk_advanced.checked = advanced ? true : false;
  }
}

/**
 * Function to fill token address selection list with token addresses.
 * @param select_tokens HTMLSelectElement to display token addresses to.
 * @param tokens Available tokens.
 */
function makeTokensList(
  select_tokens: HTMLSelectElement,
  select_amount: HTMLSelectElement,
  tokens: [string, Asset][]
) {
  for (let i = 0; i < tokens.length; i++) {
    const option = document.createElement("option");
    const token = tokens[i];
    option.value = token[0];
    option.text = token[0];
    select_tokens.add(option);

    const option_amount = document.createElement("option");
    // check if selected "one more time"
    option_amount.value = token[0];
    option_amount.text = (<Tokens>token[1]).value.length + "";
    select_amount.add(option_amount);
  }
}

/**
 * Function for continue event in transfer.
 * @param advanced Selection of advanced transfer functionality.
 * @param tokenAddress Token address for transfer.
 * @param amount Amount of tokens to transfer.
 * @param recipientAddress Recipient address for transfer.
 */
function transferContinueButtonEvent(
  advanced: boolean,
  tokenAddress: string,
  amount: string,
  recipientAddress: string
) {
  const { valid, message } = checkInputsForTransfer(
    tokenAddress,
    amount,
    recipientAddress
  );

  if (!valid) {
    alert(message);
  } else {
    const amountParsed = parseFloat(amount);
    if (advanced) {
      htmlAdvancedTransfer(tokenAddress, amountParsed, recipientAddress);
    } else {
      const tokenIDs = getTokenIDsForTransfer(tokenAddress, amountParsed);
      htmlTransferConfirmation(
        tokenAddress,
        amountParsed,
        recipientAddress,
        tokenIDs
      );
    }
  }
}

/**
 * Functionality to check the inputs for the transfer.
 * @param tokenAddress Token address for transfer.
 * @param amount Amount of tokens to transfer.
 * @param recipientAddress Recipient address for transfer.
 * @returns valid If the transfer inputs are valid.
 * @returns message If input is unvalid.
 */
function checkInputsForTransfer(
  tokenAddress: string,
  amount: string,
  recipientAddress: string
): { valid: boolean; message: string } {
  let valid = true;
  let message = "";
  if (tokenAddress == "") {
    message = "Please select the address of the token to transfer.";
    valid = false;
    return { valid, message };
  } else if (amount == "") {
    message = "Please input the amount of the tokens to transfer.";
    valid = false;
    return { valid, message };
  } else if (recipientAddress == "") {
    message = "Please input the address of the recipient.";
    valid = false;
    return { valid, message };
  }
  const amountParsed = parseFloat(amount);
  if (
    Number.isNaN(amountParsed) ||
    amountParsed <= 0 ||
    !Number.isInteger(amountParsed)
  ) {
    message = "Please enter a valid amount.";
    valid = false;
    return { valid, message };
  }
  const tokens = <Tokens>account.values.values.get(tokenAddress);
  if (amountParsed > tokens.value.length) {
    message =
      "The selected token does not have enough tokens available. Please adjust the amount or select another token.";
    valid = false;
    return { valid, message };
  }
  return { valid, message };
}

/**
 * Function for transfer event.
 * Execute the transfer and display whether the transfer was successful or not.
 * @param tokenAddress Token address for transfer.
 * @param amount Amount of tokens to transfer.
 * @param recipientAddress Recipient address for transfer.
 * @param tokenIDs Optional, IDs to transfer.
 */
async function transferEvent(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  tokenIDs?: bigint[]
) {
  tokenIDs =
    typeof tokenIDs == "undefined"
      ? getTokenIDsForTransfer(tokenAddress, amount)
      : tokenIDs;
  const { status, error } = await transferTo(
    session,
    tokenAddress,
    recipientAddress,
    tokenIDs
  );
  if (status == 1) {
    htmlTransferSuccesful();
  } else {
    const err: Error = <Error>error;
    alert("Transfer failed!: " + err.message);
  }
}

/**
 * Function to display successful transfer.
 */
function htmlTransferSuccesful() {
  div_transfer.innerHTML = `
    <div class="successful-div third-layer-window">Transfer Succesful!</div>
    <form class="successful-transfer-form">
      <button type="button" class="return-btn">return</button>
    </form>
  `;
  const btn_return = document.querySelector<HTMLInputElement>(
    ".successful-transfer-form .return-btn"
  )!;
  btn_return.addEventListener("click", () => htmlTransfer());
}

/**
 * Function to display advanced transfer, where token IDs are selected by the user.
 * @param tokenAddress Token address for transfer.
 * @param amount Amount of tokens to transfer.
 * @param recipientAddress Recipient address for transfer.
 * @param checkedTokenIDs Optional, token IDs for transfer. Filled in if given.
 */
function htmlAdvancedTransfer(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  checkedTokenIDs?: bigint[]
) {
  div_transfer.innerHTML = `

    <h2>Token:</h2>
    <div class="token-address-div third-layer-window">${tokenAddress}</div>
    <h2>To recipient:</h2>
    <div class="recipient-address-div third-layer-window">${recipientAddress}</div>
    <h2>Choose ${amount} token ID${amount > 1 ? "s" : ""} to send</h2>
    <div class= checkboxesIDs></div>
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
    advancedTransferContinueButtonEvent(
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
    htmlTransfer(tokenAddress, amount, recipientAddress, true)
  );
}

/**
 * Function to fill token IDs selection. Checkboxes are created.
 * @param div_chkIDs HTML element to fill in the checkboxes.
 * @param availableTokenIDs Available token IDs.
 * @param checkedTokenIDs Optional, token IDs for transfer. Filled in if given.
 * @returns chk_IDs List of checkboxes for token IDs.
 */
function makeTokenIDsCheckboxes(
  div_chkIDs: HTMLDivElement,
  availableTokenIDs: bigint[],
  checkedTokenIDs?: bigint[]
): HTMLInputElement[] {
  const chk_IDs: HTMLInputElement[] = [];
  for (let i = 0; i < availableTokenIDs.length; i++) {
    const tokenID = availableTokenIDs[i];
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = `${tokenID}`;
    checkbox.id = `${tokenID}`;
    checkbox.checked =
      typeof checkedTokenIDs != "undefined" && checkedTokenIDs.includes(tokenID)
        ? true
        : false;
    chk_IDs.push(checkbox);
    const span = document.createElement("span");
    span.innerHTML = `${tokenID} </br>`;
    div_chkIDs.appendChild(checkbox);
    div_chkIDs.appendChild(span);
  }

  return chk_IDs;
}

/**
 * Function for continue button event in advanced transfer.
 * @param tokenAddress Token address for transfer.
 * @param amount Amount of tokens to transfer.
 * @param recipientAddress Recipient address for transfer.
 * @param chk_IDs List of checkboxes for token IDs.
 */
function advancedTransferContinueButtonEvent(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  chk_IDs: HTMLInputElement[]
) {
  const chk_checkedIDs = chk_IDs.filter((checkbox) => checkbox.checked);
  if (chk_checkedIDs.length != amount) {
    alert(
      `Please choose ${amount} token ID(s)! (currently ${chk_checkedIDs.length} chosen)`
    );
    return;
  }
  const tokenIDs = chk_checkedIDs.map((checkbox) => BigInt(checkbox.value));
  htmlTransferConfirmation(
    tokenAddress,
    amount,
    recipientAddress,
    tokenIDs,
    chk_IDs
  );
}

/**
 * Function to display transfer confirmation.
 * @param tokenAddress Token address for transfer.
 * @param amount Amount of tokens to transfer.
 * @param recipientAddress Recipient address for transfer.
 * @param tokenIDs IDs to transfer.
 * @param chk_IDs Optional, list of checkboxes for token IDs.
 */
function htmlTransferConfirmation(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  tokenIDs: bigint[],
  chk_IDs?: HTMLInputElement[]
) {
  div_transfer.innerHTML = `
    <h2>Please confirm the transfer</h2>
    <h2>${amount} Token${amount > 1 ? "s" : ""} of:</h2>
    <div class="token-address-div third-layer-window">${tokenAddress}</div>
    <h2>token ID:</h2>
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
    span.innerHTML = `${tokenIDs[i]}`;
    div_tokenIDs.appendChild(span);
  }
  const btn_makeTransfer = document.querySelector<HTMLInputElement>(
    ".confirm-transfer-form .confirm-transfer-btn"
  )!;
  btn_makeTransfer.addEventListener("click", () =>
    transferEvent(tokenAddress, amount, recipientAddress, tokenIDs)
  );

  const btn_return = document.querySelector<HTMLInputElement>(
    ".confirm-transfer-form .return-btn"
  )!;
  btn_return.addEventListener("click", () =>
    typeof chk_IDs != "undefined"
      ? htmlAdvancedTransfer(tokenAddress, amount, recipientAddress, tokenIDs)
      : htmlTransfer(tokenAddress, amount, recipientAddress)
  );
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

/**
 * Function to get token IDs for the transfer.
 * @param tokenAddress Token address for transfer.
 * @param amount Amount of tokens to transfer.
 * @returns Token IDs for the transfer.
 */
function getTokenIDsForTransfer(
  tokenAddress: string,
  amount: number
): bigint[] {
  const tokens = <Tokens>account.values.values.get(tokenAddress)!;
  return tokens.value.slice(0, amount);
}
