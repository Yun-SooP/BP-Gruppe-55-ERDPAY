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
      
  <div class="inner-window-container">
      <img
        class="erdstall-logo"
        src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
        alt="TypeScript"
      />
      <button class="goback-button">
        <i class="fa-solid fa-angle-left"></i>
      </button>

      <h1>Transfer</h1>
      <div class="inner-window">
      </div>

      <h1>Mint</h1>
      <form class="mint-form">
        <input type="text" placeholder="token address" />
        <input type="text" placeholder="token ID" />
        <input type="button" value="mint new token" />
      </form>

      <span class="private-key">your private key</span>
    </div>
    
  `;

  const btn_privateKey =
    document.querySelector<HTMLButtonElement>(".private-key")!;
  btn_privateKey.addEventListener("click", () => alert(privateKey));

  // Event listener for going back one page
  const btn_return = document.querySelector<HTMLButtonElement>(
    ".inner-window-container .goback-button"
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
    ".inner-window-container .inner-window"
  )!;

  if (account.values.values.size == 0) {
    body_transfer.innerHTML = `
      <p>You have no token available.</p>
    `;
    body_transfer.style.height = "70px";
  } else {
    body_transfer.innerHTML = `
      <h2>Choose your token to send</h2>
      <header>
          <span>Available Tokens</span>
          <span>amount</span>
      </header>

      <div class="token-list">
          <select class="token-list__tokens" size = "5"></select>
          <select class="token-list__amount" size = "5"></select>
      </div>

      <form class="inner-form">
        <div class="inner-form__token-amount">
          <input type = "text" placeholder="amount"/>
          <span>Tokens</span>
        </div>
        <input type="text" placeholder="recipient address" />
        <input type="button" value="make transfer" />
      </form>
    `;
    const select_tokens = document.querySelector<HTMLSelectElement>(
      ".token-list__tokens"
    )!;

    const select_amount = document.querySelector<HTMLSelectElement>(
      ".token-list__amount"
    )!;

    var isSyncingLeftScroll = false;
    var isSyncingRightScroll = false;

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
      ".inner-form__token-amount input"
    )!;
    for (let i = 0; i < tokens.length; i++) {
      const option_token = document.createElement("option");
      const token = tokens[i];
      option_token.value = token[0];
      option_token.text = token[0];
      select_tokens.add(option_token);

      const option_amount = document.createElement("option");
      // check if selected "one more time"
      option_amount.value = token[0];
      option_amount.text = (<Tokens>token[1]).value.length + "";
      select_amount.add(option_amount);
    }

    const txt_recipientAddress = document.querySelector<HTMLInputElement>(
      '.inner-form input[placeholder="recipient address"]'
    )!;
    const btn_makeTransfer = document.querySelector<HTMLInputElement>(
      '.inner-form input[value="make transfer"]'
    )!;

    btn_makeTransfer.addEventListener("click", async () => {
      if (select_tokens.value == "") {
        alert("Please select_tokens a token to transfer.");
        return;
      }
      const { status, error } = await transferTo(
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
      await htmlTransfer();
    });
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
 * @param txt_amount Amount of the token to transfer
 * @param address Address to transfer to
 * @returns Status and error message
 */
async function transferTo(
  session: Session,
  token: string,
  txt_amount: number,
  address: string
) {
  let transaction;
  let receipt;
  let status;
  let error;

  if (
    Number.isNaN(txt_amount) ||
    txt_amount <= 0 ||
    !Number.isInteger(txt_amount)
  ) {
    status = 0;
    error = new Error("Please enter a valid txt_amount.");
    return { status, error };
  }

  const tokens = <Tokens>account.values.values.get(token)!;
  tokens.value = tokens.value.slice(0, txt_amount);
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
