import "./style.css";
import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
import { Account } from "@polycrypt/erdstall/ledger";
import { Asset } from "@polycrypt/erdstall/ledger/assets";
import { Assets } from "@polycrypt/erdstall/ledger/assets";
import { newSession, restoreSession } from "./setup_session.ts";
import { mint } from "./mint.ts";
import { Tokens } from "@polycrypt/erdstall/ledger/assets";
import { widget } from "./widget.ts";

let session: Session;
let privateKey: string;
let account: Account;
let apphtml: HTMLDivElement;

/**
 * Function to display selection between a new session and restoring old session.
 * @param html_widget HTML to display to
 */
export function htmlCreateSessionForTransfer(html_widget: HTMLDivElement) {
  apphtml = html_widget;
  html_widget.innerHTML = `
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
  logo_return.addEventListener("click", () => widget(apphtml));

  const btn_return = document.querySelector<HTMLButtonElement>(
    ".session-window .goback-button"
  )!;
  btn_return.addEventListener("click", () => widget(apphtml));

  btn_newSession.addEventListener("click", async () => {
    let newSession_;
    try {
      newSession_ = await newSession();
    } catch (err) {
      alert(err);
      return;
    }
    session = newSession_!.session;
    privateKey = newSession_!.privateKey;
    htmlTransfer();
  });

  btn_restoreSession.addEventListener("click", async () => {
    privateKey = txt_previousPrivateKey.value;
    let restoredSession;
    try {
      restoredSession = await restoreSession(privateKey);
    } catch (err) {
      alert(err);
      return;
    }
    session = restoredSession!;
    htmlTransfer();
  });
}

/**
 * Function to display main transfer functionality. Displays minting and transfer.
 */
async function htmlTransfer() {
  account = await session!.getAccount(session!.address);

  apphtml.innerHTML = `
      
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
      <form class="mint-form">
        <input type="text" placeholder="token address" />
        <input type="text" placeholder="token ID" />
        <input type="button" value="mint new token" />
      </form>

      <span class="private-key">your private key</span>
      <span class="session-address">your address</span>
    </div>
    
  `;

  const btn_privateKey =
    document.querySelector<HTMLButtonElement>(".private-key")!;
  btn_privateKey.addEventListener("click", () => alert(privateKey));

  const btn_sessionAddress =
    document.querySelector<HTMLButtonElement>(".session-address")!;
  btn_sessionAddress.addEventListener("click", () => alert(session!.address))

  // Event listener for going back one page
  const btn_return = document.querySelector<HTMLButtonElement>(
    ".transfer-window-container .goback-button"
  )!;
  btn_return.addEventListener("click", () =>
    htmlCreateSessionForTransfer(apphtml)
  );

  const logo_return =
    document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => widget(apphtml));

  btn_return.addEventListener("click", () =>
    htmlCreateSessionForTransfer(apphtml)
  );

  const btn_mint = document.querySelector<HTMLInputElement>(
    '.mint-form input[value="mint new token"]'
  )!;

  const body_transfer = document.querySelector<HTMLDivElement>(
    ".transfer-window-container .transfer-window"
  )!;

  if (account.values.values.size == 0) {
    body_transfer.innerHTML = `
      <p>You have no token available.</p>
    `;
    body_transfer.style.height = "70px";
  } else {
    body_transfer.innerHTML = `
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
        <input type="button" value="make transfer" />
      </form>
    `;
    const select_tokens = document.querySelector<HTMLSelectElement>(".token-list")!;
    const tokens = Array.from(account.values.values.entries());
    const txt_amount = document.querySelector<HTMLInputElement>(
      ".transfer-form__token-txt_amount"
    )!;
    for (let i = 0; i < tokens.length; i++) {
      const option = document.createElement("option");
      const token = tokens[i];
      option.value = token[0];
      option.text =
        token[0] + " (Amount: " + (<Tokens>token[1]).value.length + ")";
      select_tokens.add(option);
    }

    const txt_recipientAddress = document.querySelector<HTMLInputElement>(
      '.transfer-form input[placeholder="recipient address"]'
    )!;
    const btn_makeTransfer = document.querySelector<HTMLInputElement>(
      '.transfer-form input[value="make transfer"]'
    )!;

    const checkbox_advanced = document.querySelector<HTMLInputElement>("#advancedTransfer")!

    btn_makeTransfer.addEventListener("click", async () => {
      if (select_tokens.value == "") {
        alert("Please select the address of the token to transfer.");
        return;
      } else if (txt_amount.value == "") {
        alert("Please input the amount of the tokens to transfer.")
        return;
      } else if (txt_recipientAddress.value == "") {
        alert("Please input the address of the recipient.")
        return;
      }
      const amount = parseFloat(txt_amount.value)
      if (Number.isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
        alert("Please enter a valid amount.")
        return
      }
      const selectedToken = select_tokens.value
      const tokens = <Tokens>account.values.values.get(selectedToken)
      if (amount > tokens.value.length){
        alert("The selected token does not have enought amount of tokens. Please adjust the amount or select another token.")
        return
      }
      if (checkbox_advanced.checked){
        htmlAdvancedTransfer(selectedToken, parseInt(txt_amount.value), txt_recipientAddress.value)
      } else {
        transferEvent(false)
      }
    });

    checkbox_advanced.addEventListener("click", () => {
      btn_makeTransfer.value = checkbox_advanced.checked? "select IDs" : "make transfer"
    })

    async function transferEvent(advanced: boolean, tokenIDs?: bigint[]){
      const { status, error } = advanced?
      await transferTo(
        session,
        select_tokens.value,
        parseFloat(txt_amount.value),
        txt_recipientAddress.value,
        tokenIDs
      ) :
      await transferTo(
        session,
        select_tokens.value,
        parseFloat(txt_amount.value),
        txt_recipientAddress.value
      );
      if (status == 1) {
        alert("Transfer succesful!");
      } else if (status == 0) {
        const err: Error = <Error>error;
        alert("Transfer failed!: " + err.message);
        return;
      }
      htmlTransfer()
    }

    async function htmlAdvancedTransfer(tokenAddress: string, amount: number, addressRecipient: string){
      body_transfer.innerHTML = `
        <h2>Token: ${tokenAddress}<h2>
        <h2>To: ${addressRecipient}<h2>
        <h2>Choose ${amount} token ID(s) to send</h2>
        <div id= checkboxesIDs></div>
        <form class="transfer-form">
          <input type="button" value="make transfer" />
        </form>
      `;
      const availableTokenIDs = (<Tokens>account.values.values.get(tokenAddress)).value;
      const div_checkboxesIDs = document.querySelector<HTMLDivElement>("#checkboxesIDs")!;
      const checkboxes_IDs: HTMLInputElement[] = []
      const btn_makeTransfer = document.querySelector<HTMLInputElement>(
        '.transfer-form input[value="make transfer"]'
      )!;
      for (let i = 0; i < availableTokenIDs.length; i++) {
        const tokenID = availableTokenIDs[i]
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.value = `${tokenID}`
        checkbox.id = `${tokenID}`
        checkboxes_IDs.push(checkbox)
        const span =document.createElement("span");
        span.innerHTML = `${tokenID} </br>`;
        div_checkboxesIDs.appendChild(checkbox)
        div_checkboxesIDs.appendChild(span)
      }
      btn_makeTransfer.addEventListener("click", async () => {
        const checkboxes_checkedIDs = checkboxes_IDs.filter(checkbox => checkbox.checked)
        if (checkboxes_checkedIDs.length != amount){
          alert(`Please choose ${amount} token ID(s)! (currently ${checkboxes_checkedIDs.length} chosen)`)
          return
        }
        const checkedIDs = checkboxes_checkedIDs.map(checkbox=>BigInt(checkbox.value))
        transferEvent(true, checkedIDs)
      })
    }
  }


  btn_mint.addEventListener("click", async () => {
    const txt_tokenAddress = document.querySelector<HTMLInputElement>(
      ".mint-form input[placeholder='token address']"
    )!;
    const txt_tokenId = document.querySelector<HTMLInputElement>(
      ".mint-form input[placeholder='token ID']"
    )!;
    const { status, error } = await mint(
      session,
      txt_tokenAddress.value,
      parseFloat(txt_tokenId.value)
    );
    if (status == 0) {
      const err: Error = <Error>error;
      alert("Minting failed: " + err.message);
      return;
    } else if (status == 1) {
      alert("Token succesfully minted!");
    }
    await htmlTransfer();
  });
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
  token: string,
  amount: number,
  address: string,
  tokenIDs?: bigint[]
) {
  let transaction;
  let receipt;
  let status;
  let error;

  const tokens = <Tokens>account.values.values.get(token)!;

  if (typeof tokenIDs !== 'undefined'){
    if (amount != tokenIDs.length){
      status = 0
      error = new Error("The amount of tokens does not match the amount of the IDs.")
      return { status , error }
    }
    tokens.value = tokenIDs
  } else {
    tokens.value = tokens.value.slice(0, amount);
  }
  const asset = <Asset>tokens;
  const assets_transfer = new Assets({ token: token, asset: asset });

  try {
    transaction = await session.transferTo(
      assets_transfer,
      Address.fromString(address)
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
