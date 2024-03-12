import "./style.css";
import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
import { Account } from "@polycrypt/erdstall/ledger";
import { Asset } from "@polycrypt/erdstall/ledger/assets";
import { Assets } from "@polycrypt/erdstall/ledger/assets";
import { Tokens } from "@polycrypt/erdstall/ledger/assets";
import * as utils from "./utils.ts";

let session: Session;
let account: Account;
let div_transfer: HTMLDivElement;

let newTokenIDs: bigint[];
let selectedTokenIDs: bigint[];
let btn_cancelChangeTokenIDs: HTMLButtonElement;

type BooleanWrapper = {
  value: boolean;
};

/**
 * Function to display transfer functionality.
 * Optional paramters fill out inputs in beforehand.
 * @param tokenAddressRestore Optional, token address for transfer.
 * @param amountRestore Optional, amount of tokens to transfer.
 * @param tokenIDsRestore Optional, token ids for transfer.
 * @param recipientAddressRestore Optional, recipient address for transfer.
 */
export async function htmlTransfer(
  div: HTMLDivElement,
  sessionForTransfer: Session,
  tokenAddressRestore?: string,
  amountRestore?: string,
  tokenIDsRestore?: bigint[],
  recipientAddressRestore?: string
) {
  session = sessionForTransfer;
  div_transfer = div;
  account = await session!.getAccount(session!.address);
  if (account.values.values.size == 0) {
    div_transfer.innerHTML = `
      <p>You have no token available.</p>
    `;
  } else {
    utils.setWindowHeight(div_transfer, 500);
    div_transfer.innerHTML = `
      <h2>Choose your token and the amount of tokens you want to send</h2>
      <header class="token-list-header">
          <span>Available Tokens</span>
          <span>Amount</span>
      </header>
      <span id="errTokenAddress"></span>
      <div id="token-list" class="token-list">
        <select class="token-list__tokens" size = "5"></select>
        <select class="token-list__amount" disabled size = "5"></select>
      </div>

      <form class="transfer-form">
         <div class="transfer-form__token-amount">
              <span id="errTokenAmount"></span>
              <input type = "text" placeholder="amount" spellcheck="false" id="tokenAmount"/>
              <span>Tokens</span>
        </div>
        <div id="changeTokenIDs">
          <button type="button" class="changeTokenIDs-btn">change</button>
        </div>
        <div id="tokenIDs">
        </div>
        
        <span id="errRecipientAddr"></span>
        <input type="text" class="transfer-form__recipient-address" placeholder="recipient address (ex. 0x1234...)" spellcheck="false" id="recipientAddr"/>
        
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
    syncScrolls(select_tokens, select_amount);

    const tokens = Array.from(account.values.values.entries());

    const txt_amount = document.querySelector<HTMLInputElement>(
      ".transfer-form__token-amount input"
    )!;
    const div_tokenIDs = document.querySelector<HTMLDivElement>("#tokenIDs")!;

    txt_amount.addEventListener("input", () => {
      const tokenAddress = select_tokens.value;
      const tokens = <Tokens>account.values.values.get(tokenAddress);
      const valid = utils.checkAmount(
        txt_amount.value,
        tokens,
        "errTokenAmount",
        "tokenAmount"
      );
      if (valid && tokenAddress !== "" && !selecting.value) {
        const initialTokenIDs = utils.getTokenIDs(
          account,
          tokenAddress,
          parseFloat(txt_amount.value)
        );
        makeTokenIDsList(div_tokenIDs, initialTokenIDs);
      }
    });

    const txt_recipientAddress = document.querySelector<HTMLInputElement>(
      '.transfer-form input[placeholder="recipient address (ex. 0x1234...)"]'
    )!;

    utils.makeTokensList(select_tokens, select_amount, tokens);

    select_tokens.addEventListener("change", () => {
      const tokenAddress = select_tokens.value;
      txt_amount.value = "1";
      const firstTokenID = utils.getTokenIDs(account, tokenAddress, 1);
      selectedTokenIDs = firstTokenID;
      makeTokenIDsList(div_tokenIDs, firstTokenID);
    });

    const selecting: BooleanWrapper = { value: false };

    const btn_changeTokenIDs = document.querySelector<HTMLButtonElement>(
      ".changeTokenIDs-btn"
    )!;
    btn_changeTokenIDs.addEventListener("click", () => {
      const tokenAddress = select_tokens.value;
      const tokenIDsAvailable = (<Tokens>(
        account.values.values.get(tokenAddress)
      )).value;
      changeTokenIDsButtonEvent(
        selecting,
        tokenIDsAvailable,
        txt_amount,
        div_tokenIDs,
        btn_changeTokenIDs
      );
    });

    const btn_confirm = document.querySelector<HTMLInputElement>(
      ".transfer-form__continue-btn"
    )!;

    btn_confirm.addEventListener("click", () =>
      transferContinueButtonEvent(
        select_tokens.value,
        txt_amount.value,
        selectedTokenIDs,
        txt_recipientAddress.value
      )
    );

    restoreSelections(
      tokenAddressRestore,
      select_tokens,
      amountRestore,
      txt_amount,
      tokenIDsRestore,
      div_tokenIDs,
      recipientAddressRestore,
      txt_recipientAddress
    );
  }
}
function syncScrolls(
  select_tokens: HTMLSelectElement,
  select_amount: HTMLSelectElement
) {
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
}

function restoreSelections(
  tokenAddress: string | undefined,
  select_tokens: HTMLSelectElement,
  amount: string | undefined,
  txt_amount: HTMLInputElement,
  tokenIDs: bigint[] | undefined,
  div_tokenIDs: HTMLDivElement,
  recipientAddress: string | undefined,
  txt_recipientAddress: HTMLInputElement
) {
  select_tokens.value = tokenAddress ? tokenAddress : "";
  txt_amount.value = amount ? amount : "";
  if (tokenIDs) {
    makeTokenIDsList(div_tokenIDs, tokenIDs);
  }
  txt_recipientAddress.value = recipientAddress ? recipientAddress : "";
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
  div_tokenIDs.innerHTML = "";
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
 * Initializes an event on the given 'Change Token IDs' button to enable the selection of new token IDs for transfer.
 * When the button event is triggered, it toggles the form state between selection and confirmation modes.
 * In selection mode, a form is presented to the user to choose new token IDs from available options.
 * @param selecting A wrapper object for a boolean flag indicating if the selection mode is active.
 * @param tokenIDsAvailable An array of available token IDs for selection.
 * @param txt_amount txt element for amount, it's value is adjusted when the token ids selection is confirmed
 * @param div_tokenIDs The container element where the token IDs selection form is rendered.
 * @param btn_changeTokenIDs The button element that toggles the selection mode.
 * @returns
 */
function changeTokenIDsButtonEvent(
  selecting: BooleanWrapper,
  tokenIDsAvailable: bigint[],
  txt_amount: HTMLInputElement,
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
      btn_changeTokenIDs.innerText = "change";
      div_tokenIDs.innerHTML = "";
      makeTokenIDsList(div_tokenIDs, selectedTokenIDs);
      btn_cancelChangeTokenIDs.remove();
    });
    div_changeTokenIDs?.appendChild(btn_cancelChangeTokenIDs);
    div_tokenIDs.innerHTML = "";
    newTokenIDs = makeTokenIDsSelection(div_tokenIDs, tokenIDsAvailable);
  } else {
    selecting.value = false;
    btn_changeTokenIDs.innerText = "change";
    div_tokenIDs.innerHTML = "";
    newTokenIDs.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    selectedTokenIDs = newTokenIDs;
    makeTokenIDsList(div_tokenIDs, newTokenIDs);
    txt_amount.value = selectedTokenIDs.length.toString();
    btn_cancelChangeTokenIDs!.remove();
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
 * Function for continue event in transfer.
 * If all inputs are valid, the user is passed to the confirmation.
 * @param advanced Selection of advanced transfer functionality.
 * @param tokenAddress Token address for transfer.
 * @param amount Amount of tokens to transfer.
 * @param recipientAddress Recipient address for transfer.
 */
function transferContinueButtonEvent(
  tokenAddress: string,
  amount: string,
  tokenIDs: bigint[],
  recipientAddress: string
) {
  const valid = checkInputsForTransfer(
    tokenAddress,
    amount,
    tokenIDs,
    recipientAddress
  );
  if (!valid) {
    return;
  }
  const amountParsed = parseFloat(amount);
  htmlTransferConfirmation(
    tokenAddress,
    amountParsed,
    recipientAddress,
    tokenIDs
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
  tokenIDs: bigint[]
) {
  div_transfer.innerHTML = `
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

  makeTokenIDsList(div_tokenIDs, tokenIDs);

  const btn_makeTransfer = document.querySelector<HTMLInputElement>(
    ".confirm-transfer-form .confirm-transfer-btn"
  )!;
  btn_makeTransfer.addEventListener("click", () => {
    transferEvent(tokenAddress, amount, recipientAddress, tokenIDs);
  });

  const btn_return = document.querySelector<HTMLInputElement>(
    ".confirm-transfer-form .return-btn"
  )!;
  btn_return.addEventListener("click", () =>
    htmlTransfer(
      div_transfer,
      session,
      tokenAddress,
      amount.toString(),
      tokenIDs,
      recipientAddress
    )
  );
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
  tokenIDs: bigint[],
  recipientAddress: string
): boolean {
  let valid = true;
  valid = !utils.checkTokenAddressSelected(
    tokenAddress,
    "errTokenAddress",
    "token-list"
  )
    ? false
    : valid;
  const tokens = <Tokens>account.values.values.get(tokenAddress)!;
  const validAmount = (valid = !utils.checkAmount(
    amount,
    tokens,
    "errTokenAmount",
    "tokenAmount"
  )
    ? false
    : valid);
  valid = !utils.checkRecipientAddress(
    recipientAddress,
    "errRecipientAddr",
    "recipientAddr"
  )
    ? false
    : valid;

  const amountParsed = parseFloat(amount);
  if (validAmount && tokenIDs.length != amountParsed) {
    const message = `Please select ${amountParsed} token ID${
      amountParsed > 1 ? "s" : ""
    }!`;
    utils.displayErrorMessage(message, "errTokenAmount", "tokenAmount");
    valid = false;
  }
  return valid;
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
      ? utils.getTokenIDs(account, tokenAddress, amount)
      : tokenIDs;
  const { status, error } = await transferTo(
    session,
    tokenAddress,
    recipientAddress,
    tokenIDs
  );
  if (status == 1) {
    htmlTransferSuccessful();
  } else {
    const err: Error = <Error>error;

    //when does this appear?
    alert("Transfer failed!: " + err.message);
  }
}

/**
 * Function to display successful transfer.
 */
function htmlTransferSuccessful() {
  div_transfer.innerHTML = `
    <div class="successful-div third-layer-window">Transfer Successful!</div>
    <form class="successful-form">
      <button type="button" class="return-btn">return</button>
    </form>
  `;
  const btn_return = document.querySelector<HTMLInputElement>(
    ".successful-form .return-btn"
  )!;
  btn_return.addEventListener("click", () =>
    htmlTransfer(div_transfer, session)
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
