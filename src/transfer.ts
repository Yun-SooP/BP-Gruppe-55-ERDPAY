import "./style.css";
import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
import { Account } from "@polycrypt/erdstall/ledger";
import { Asset } from "@polycrypt/erdstall/ledger/assets";
import { Assets } from "@polycrypt/erdstall/ledger/assets";
import { Tokens } from "@polycrypt/erdstall/ledger/assets";
import * as utils from "./utils.ts";
import { createToolTip } from "./utils.ts";

let session: Session;
let account: Account;
let div_transfer: HTMLDivElement;

let newTokenIDs: bigint[];
let selectedTokenIDs: bigint[];

let btn_changeTokenIDs: HTMLButtonElement;
let btn_cancelChangeTokenIDs: HTMLButtonElement;

type BooleanWrapper = {
  value: boolean;
};

/**
 * Renders the HTML interface for the transfer functionality, allowing users to select tokens,
 * specify amounts, and enter recipient addresses for transfers. If provided, fills out inputs with pre-existing values.
 *
 * @param div The HTMLDivElement where the transfer interface will be injected.
 * @param sessionForTransfer The session object used to execute the transfer.
 * @param tokenAddressRestore Optional pre-selected token address for transfer.
 * @param amountRestore Optional pre-filled amount of tokens to transfer.
 * @param tokenIDsRestore Optional pre-selected token ids for transfer.
 * @param recipientAddressRestore Optional pre-filled recipient address for transfer.
 */
export async function htmlTransfer(
  div: HTMLDivElement,
  sessionForTransfer: Session,
  tokenAddressRestore?: string,
  amountRestore?: string,
  tokenIDsRestore?: bigint[],
  recipientAddressRestore?: string
) {
  // Set the current session and div_transfer to the passed parameters
  session = sessionForTransfer;
  div_transfer = div;

  // Get the account details from the session
  account = await session!.getAccount(session!.address);

  // Check if the account has any tokens and display a message if it doesn't
  if (account.values.values.size == 0) {
    div_transfer.style.height = "110px";
    div_transfer.parentElement!.style.height = "600px";
    // If no tokens are available, inform the user with a message
    div_transfer.innerHTML = `
      <p>
          You have no token available.<br>
          Get tokens transferred to you from other account<br>
          or create your own by minting them!
      </p>
    `;
  } else {
    // If tokens are available, set up the transfer interface
    utils.setWindowHeight(div_transfer, 490);
    div_transfer.parentElement!.style.height = "750px";
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
        <div class="transfer-tokenID-section invisible-transfer-window__id-list">
          <div class="transfer__tokenID-header">
            <h2 id="token ID label">token IDs</h2>
            <div id="changeTokenIDs">
              <button type="button" class="changeTokenIDs-btn">edit</button>
            </div>
          </div>
          <div id="tokenIDs"></div>
          <span id = errTokenIDs> </span>
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

    const div_tokenIdSection = document.querySelector<HTMLDivElement>(
      ".transfer-tokenID-section"
    )!;

    //Synchronize scroll of select_tokens and select_amount
    utils.syncScrolls(select_tokens, select_amount);

    const tokens = Array.from(account.values.values.entries());

    const txt_amount = document.querySelector<HTMLInputElement>(
      ".transfer-form__token-amount input"
    )!;
    const div_tokenIDs = document.querySelector<HTMLDivElement>("#tokenIDs")!;

    // Set up an event listener for the amount input field to validate and adjust token IDs upon input
    txt_amount.addEventListener("input", () => {
      const tokenAddress = select_tokens.value;
      const tokens = <Tokens>account.values.values.get(tokenAddress);
      const validAmount = utils.checkAmount(
        txt_amount.value,
        "errTokenAmount",
        "tokenAmount",
        tokens
      );
      // If the amount is valid, not empty, and the user is not currently selecting token IDs
      if (validAmount && tokenAddress !== "" && !selecting.value) {
        // adjust the token ids to match the amount
        newTokenIDs = utils.extendTokenIDs(
          selectedTokenIDs,
          tokens.value,
          Number(txt_amount.value)
        );
        selectedTokenIDs = newTokenIDs;
        utils.makeTokenIDsList(div_tokenIDs, newTokenIDs);
      }
    });

    const txt_recipientAddress = document.querySelector<HTMLInputElement>(
      '.transfer-form input[placeholder="recipient address (ex. 0x1234...)"]'
    )!;

    // Populate the token and amount select lists with account data
    utils.makeTokensList(select_tokens, select_amount, tokens);

    // Create a BooleanWrapper object to track the state of token ID selection
    const selecting: BooleanWrapper = { value: false };

    btn_changeTokenIDs = document.querySelector<HTMLButtonElement>(
      ".changeTokenIDs-btn"
    )!;

    // Set up an event listener for the edit button next to token IDs
    btn_changeTokenIDs.addEventListener("click", () => {
      // Retrieve the token address and available IDs for the selected token
      const tokenAddress = select_tokens.value;
      const tokenIDsAvailable = utils.getTokenIDs(account, tokenAddress);
      // Invoke the function to handle the edit token IDs event
      changeTokenIDsButtonEvent(
        selecting,
        tokenIDsAvailable,
        txt_amount,
        div_tokenIDs
      );
    });

    // Set up an event listener for when the user changes the selected token
    select_tokens.addEventListener("change", () =>
      eventSelectTokenAddress(
        select_tokens,
        txt_amount,
        div_tokenIDs,
        div_tokenIdSection,
        selecting
      )
    );

    // Select the button to confirm the transfer and attach an event listener
    const btn_confirm = document.querySelector<HTMLInputElement>(
      ".transfer-form__continue-btn"
    )!;

    // When the confirm button is clicked, validate the inputs and potentially proceed to the transfer confirmation
    btn_confirm.addEventListener("click", () => {
      transferContinueButtonEvent(
        select_tokens.value,
        txt_amount.value,
        selectedTokenIDs,
        txt_recipientAddress.value,
        selecting
      );
    });

    // If any pre-existing values are provided (e.g., from a previous state), restore those selections
    restoreSelections(
      tokenAddressRestore,
      select_tokens,
      amountRestore,
      txt_amount,
      tokenIDsRestore,
      div_tokenIDs,
      div_tokenIdSection,
      recipientAddressRestore,
      txt_recipientAddress
    );

    // Create tooltip
    if (document.querySelector<HTMLDivElement>(".tooltip") == null) {
      const wrapperDiv = document.querySelector<HTMLDivElement>(
        ".transfer__tokenID-header"
      )!;
      const text =
        'Token IDs are selected based on the chosen amount. \n Press "edit" to change the selected IDs.';
      createToolTip(
        wrapperDiv,
        "top",
        text,
        "l-transfer-tooltip",
        "transfer-tooltip"
      );
    }
  }
}

/**
 * Handles the event when a user selects a token address from the select element.
 * It updates the display to show the token ID section and populates the first token ID.
 * @param select_tokens The select element for selecting tokens.
 * @param txt_amount The input element for the token transfer amount.
 * @param div_tokenIDs The container element where the list of token IDs will be displayed.
 * @param div_tokenIdSection The container element for the token ID section.
 * @param selecting
 */
function eventSelectTokenAddress(
  select_tokens: HTMLSelectElement,
  txt_amount: HTMLInputElement,
  div_tokenIDs: HTMLDivElement,
  div_tokenIdSection: HTMLDivElement,
  selecting: BooleanWrapper
) {
  // Adjust the window height for the additional token ID section
  utils.setWindowHeight(div_transfer, 670);
  div_transfer.parentElement!.style.height = "930px";

  // Retrieve the first token ID based on the selected token
  const tokenAddress = select_tokens.value;
  txt_amount.value = "1";
  const firstTokenID = utils.getTokenIDs(account, tokenAddress, 1);
  selectedTokenIDs = firstTokenID;

  // Make the token ID section visible
  div_tokenIdSection.classList.remove("invisible-transfer-window__id-list");
  div_tokenIdSection.classList.add("visible-transfer-window__id-list");
  // Display the first token ID in the list
  utils.makeTokenIDsList(div_tokenIDs, firstTokenID);
  // Change the selected token's background color to indicate selection
  utils.selectedTokenToBlue(select_tokens);

  if (selecting.value) {
    btn_changeTokenIDs.innerText = "edit";
    btn_cancelChangeTokenIDs!.remove();
    selecting.value = false;
  }
}

/**
 * Restores the selections in the transfer form with previously inputted values.
 * This is used when a user navigates back to the transfer form from a confirmation screen.
 * @param tokenAddress - The address of the selected token. If undefined, the token selection is cleared.
 * @param select_tokens - The dropdown element for selecting tokens.
 * @param amount - The amount of the token to transfer. If undefined, the amount field is cleared.
 * @param txt_amount - The input element for the token transfer amount.
 * @param tokenIDs - An array of token IDs to be transferred. If undefined, the token ID list is not updated.
 * @param div_tokenIDs - The container element where the list of token IDs will be displayed.
 * @param div_tokenIdSection - The container element for the token ID section.
 * @param recipientAddress - The address of the transfer recipient. If undefined, the recipient address field is cleared.
 * @param txt_recipientAddress - The input element for the recipient's address.
 */
function restoreSelections(
  tokenAddress: string | undefined,
  select_tokens: HTMLSelectElement,
  amount: string | undefined,
  txt_amount: HTMLInputElement,
  tokenIDs: bigint[] | undefined,
  div_tokenIDs: HTMLDivElement,
  div_tokenIdSection: HTMLDivElement,
  recipientAddress: string | undefined,
  txt_recipientAddress: HTMLInputElement
) {
  select_tokens.value = tokenAddress ? tokenAddress : "";
  txt_amount.value = amount ? amount : "";
  if (tokenIDs) {
    // Adjust the window height for the additional token ID section
    utils.setWindowHeight(div_transfer, 670);
    div_transfer.parentElement!.style.height = "930px";

    // Make the token ID section visible
    div_tokenIdSection.classList.remove("invisible-transfer-window__id-list");
    div_tokenIdSection.classList.add("visible-transfer-window__id-list");

    utils.makeTokenIDsList(div_tokenIDs, tokenIDs);

    // Change the selected token's background color to indicate selection
    utils.selectedTokenToBlue(select_tokens);
  }
  txt_recipientAddress.value = recipientAddress ? recipientAddress : "";
}

/**
 * Initializes an event on the given 'Change Token IDs' button to enable the selection of new token IDs for transfer.
 * When the button event is triggered, it toggles the form state between selection and confirmation modes.
 * In selection mode, a form is presented to the user to choose new token IDs from available options.
 * @param selecting A wrapper object for a boolean flag indicating if the selection mode is active.
 * @param tokenIDsAvailable An array of available token IDs for selection.
 * @param txt_amount txt element for amount, it's value is adjusted when the token ids selection is confirmed
 * @param div_tokenIDs The container element where the token IDs selection form is rendered.
 * @returns
 */
function changeTokenIDsButtonEvent(
  selecting: BooleanWrapper,
  tokenIDsAvailable: bigint[],
  txt_amount: HTMLInputElement,
  div_tokenIDs: HTMLDivElement
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
      utils.resetErrorDisplay("errTokenIDs", "tokenIDs");
      utils.makeTokenIDsList(div_tokenIDs, selectedTokenIDs);
      txt_amount.value = selectedTokenIDs.length.toString();
      btn_cancelChangeTokenIDs.remove();
    });
    div_changeTokenIDs?.appendChild(btn_cancelChangeTokenIDs);
    div_tokenIDs.innerHTML = "";
    newTokenIDs = makeTokenIDsSelection(div_tokenIDs, tokenIDsAvailable);
  } else {
    if (newTokenIDs.length == 0) {
      const message = "Select at least 1 token ID.";
      utils.displayErrorMessage(message, "errTokenIDs", "tokenIDs");
      return;
    } else {
      utils.resetErrorDisplay("errTokenIDs", "tokenIDs");
    }
    selecting.value = false;
    btn_changeTokenIDs.innerText = "edit";
    newTokenIDs.sort();
    selectedTokenIDs = newTokenIDs;
    utils.makeTokenIDsList(div_tokenIDs, newTokenIDs);
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
  const newTokenIDs: bigint[] = [];
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
    span.title = tokenIDString;
    span.addEventListener("click", () => {
      if (!span.classList.contains("clicked-clickable-token-id")) {
        span.classList.add("clicked-clickable-token-id");
        newTokenIDs.push(tokenIDs[i]);
      } else {
        span.classList.remove("clicked-clickable-token-id");
        const index = newTokenIDs.indexOf(tokenIDs[i]);
        newTokenIDs.splice(index, 1);
      }
    });
    if (selectedTokenIDs.includes(tokenIDs[i])) {
      span.classList.add("clicked-clickable-token-id");
      newTokenIDs.push(tokenIDs[i]);
    }
    div_tokenIDs.appendChild(span);
  }
  return newTokenIDs;
}

/**
 * Handles the click event for the "Continue" button during a transfer operation.
 * This function validates the transfer input fields and, if valid, proceeds to display the transfer confirmation interface.
 *
 * @param tokenAddress The address of the token contract for the tokens being transferred.
 * @param amount The string representing the quantity of tokens to transfer.
 * @param tokenIDs The array of token IDs selected for transfer.
 * @param recipientAddress The address of the recipient receiving the transfer.
 * @param selecting A BooleanWrapper indicating whether token selection is in progress.
 */
function transferContinueButtonEvent(
  tokenAddress: string,
  amount: string,
  tokenIDs: bigint[],
  recipientAddress: string,
  selecting: BooleanWrapper
) {
  const valid = checkInputsForTransfer(
    tokenAddress,
    amount,
    recipientAddress,
    selecting
  );
  if (!valid) {
    return;
  }
  utils.setWindowHeight(div_transfer, 550);
  div_transfer.parentElement!.style.height = "850px";
  const amountParsed = parseFloat(amount);
  htmlTransferConfirmation(
    tokenAddress,
    amountParsed,
    recipientAddress,
    tokenIDs
  );
}

/**
 * Validates the input fields for a token transfer, checking the token address, amount, and recipient address.
 * It provides feedback for any validation errors and indicates whether the transfer inputs are valid.
 *
 * @param tokenAddress The blockchain address of the token to be transferred.
 * @param amount The quantity of tokens to transfer.
 * @param recipientAddress The address of the transfer recipient.
 * @param selecting A BooleanWrapper indicating whether token selection is in progress.
 * @returns A boolean indicating whether all transfer inputs are valid.
 */
function checkInputsForTransfer(
  tokenAddress: string,
  amount: string,
  recipientAddress: string,
  selecting: BooleanWrapper
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
  valid = !utils.checkAmount(amount, "errTokenAmount", "tokenAmount", tokens)
    ? false
    : valid;
  valid = !utils.checkRecipientAddress(
    recipientAddress,
    "errRecipientAddr",
    "recipientAddr"
  )
    ? false
    : valid;
  if (selecting.value) {
    const message = "Please confirm the token IDs selection first.";
    utils.displayErrorMessage(message, "errTokenIDs", "tokenIDs");
    valid = false;
  }
  return valid;
}

/**
 * Renders the transfer confirmation interface, displaying the details of the transfer and
 * providing buttons for the user to confirm or return to the previous screen.
 *
 * @param tokenAddress The blockchain address of the token to be transferred.
 * @param amount The quantity of tokens to transfer.
 * @param recipientAddress The address of the transfer recipient.
 * @param tokenIDs An array of token IDs that the user wishes to transfer.
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

  utils.makeTokenIDsList(div_tokenIDs, tokenIDs);

  const btn_makeTransfer = document.querySelector<HTMLInputElement>(
    ".confirm-transfer-form .confirm-transfer-btn"
  )!;
  btn_makeTransfer.addEventListener("click", async () => {
    await transferEvent(tokenAddress, amount, recipientAddress, tokenIDs);
  });

  const btn_return = document.querySelector<HTMLInputElement>(
    ".confirm-transfer-form .return-btn"
  )!;
  btn_return.addEventListener("click", () => {
    htmlTransfer(
      div_transfer,
      session,
      tokenAddress,
      amount.toString(),
      tokenIDs,
      recipientAddress
    );
  });
}

/**
 * Initiates the token transfer process based on the provided details. Upon completion,
 * it displays a confirmation or an error message depending on the outcome of the transfer.
 *
 * @param tokenAddress The blockchain address of the token to be transferred.
 * @param amount The quantity of tokens to transfer.
 * @param recipientAddress The address of the recipient receiving the transfer.
 * @param tokenIDs Optionally, the specific IDs of the tokens to transfer.
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
 * Displays a message indicating that the transfer was successful and provides a button to return to the transfer screen.
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
  btn_return.addEventListener("click", () => {
    div_transfer.parentElement!.style.height = "750px";
    htmlTransfer(div_transfer, session);
  });
}

/**
 * Executes the transfer of specified tokens from the current session to a recipient address.
 * It handles the transfer process and returns the status of the operation along with any error messages.
 *
 * @param session The current session from which the transfer will be initiated.
 * @param tokenAddress The address of the token contract for the tokens being transferred.
 * @param recipientAddress The address of the recipient to whom the tokens will be transferred.
 * @param tokenIDs Optionally, the specific token IDs to transfer.
 * @returns An object containing the status of the transfer and any error message if the transfer failed.
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
