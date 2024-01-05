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

export function htmlCreateSessionForTransfer(html: HTMLDivElement) {
  apphtml = html;
  html.innerHTML = `
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
  const b_newSession = document.querySelector<HTMLInputElement>(
    ".session-window__form input[value='New Session']"
  )!;
  const b_restoreSession = document.querySelector<HTMLInputElement>(
    ".session-window__form input[value='Restore Session']"
    // to fix
  )!;

  var privateKey_previous = document.querySelector<HTMLInputElement>(
    ".session-window__form input[type=text]"
  )!;

  const logo_return = document.querySelector<HTMLButtonElement>(
    ".erdstall-logo"
  )!;
  logo_return.addEventListener("click", () => widget(apphtml));
  
  const b_return = document.querySelector<HTMLButtonElement>(
    ".session-window .goback-button"
  )!;
  b_return.addEventListener("click", () => widget(apphtml));
  
  b_newSession.addEventListener("click", async () => {
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

  b_restoreSession.addEventListener("click", async () => {
    privateKey = privateKey_previous.value;
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

      <h1>Your Token</h1>
      <div class="token-window">
        
      </div>

      <h1>Transfer</h1>
      <form class="transfer-form">
        <!-- <p>Transfer to</p> -->
        <input type="text" placeholder="recipient address" />
        <input type="button" value="make transfer" />
      </form>

      <h1>Mint</h1>
      <form class="mint-form">
        <input type="text" placeholder="token address" />
        <input type="text" placeholder="token ID" />
        <input type="button" value="mint new token" />
      </form>

      <span class="private-key">your private key</span>
    </div>
    
  `;

  const b_privateKey =
    document.querySelector<HTMLButtonElement>(".private-key")!;
  b_privateKey.addEventListener("click", () => alert(privateKey));

  const b_return = document.querySelector<HTMLButtonElement>(
    ".transfer-window-container .goback-button"
  )!;
  b_return.addEventListener("click", () =>
    htmlCreateSessionForTransfer(apphtml)
  );

  const logo_return = document.querySelector<HTMLButtonElement>(
    ".erdstall-logo"
  )!;
  logo_return.addEventListener("click", () => widget(apphtml));
 
  b_return.addEventListener("click", () =>
    htmlCreateSessionForTransfer(apphtml)
  );

  const address_recipient = document.querySelector<HTMLInputElement>(
    '.transfer-form input[placeholder="recipient address"]'
  )!;
  const b_makeTransfer = document.querySelector<HTMLInputElement>(
    '.transfer-form input[value="make transfer"]'
  )!;

  const b_mint = document.querySelector<HTMLInputElement>(
    '.mint-form input[value="mint new token"]'
  )!;

  if (account.values.values.size == 0) {
    document.querySelector<HTMLDivElement>(
      ".transfer-window-container .token-window"
    )!.innerHTML = `
      <p>You have no token available.</p>
    `;
    address_recipient.disabled = true;
    b_makeTransfer.disabled = true;
  } else {
    document.querySelector<HTMLDivElement>(
      ".transfer-window-container .token-window"
    )!.innerHTML = `
      Available tokens (token address):
      <select id="token_transfer" size = "5">
      </select>
      amount: <input type = "text" id = "amount" placeholder="amount of tokens to transfer"/>
    `;
    const select =
      document.querySelector<HTMLSelectElement>("#token_transfer")!;
    const tokens = Array.from(account.values.values.entries());
    const amount = document.querySelector<HTMLInputElement>("#amount")!;
    for (let i = 0; i < tokens.length; i++) {
      const option = document.createElement("option");
      let token = tokens[i];
      option.value = token[0];
      option.text =
        token[0] + " (amount: " + (<Tokens>token[1]).value.length + ")";
      select.add(option);
    }

    b_makeTransfer.addEventListener("click", async () => {
      const { status, error } = await transferTo(
        session,
        select.value,
        parseInt(amount.value),
        address_recipient.value
      );
      if (status == 0) {
        alert("transfer failed!: " + error);
      } else if (status == 1) {
        alert("transfer succesful!");
      }
      await htmlTransfer();
    });
  }

  b_mint.addEventListener("click", async () => {
    const token_address = document.querySelector<HTMLInputElement>(
      ".mint-form input[placeholder='token address']"
    )!;
    const token_id = document.querySelector<HTMLInputElement>(
      ".mint-form input[placeholder='token ID']"
    )!;
    const { status, error } = await mint(
      session,
      token_address.value,
      parseInt(token_id.value)
    );
    if (status == 0) {
      alert("minting failed!: " + error);
    } else if (status == 1) {
      alert("token succesfully minted!");
    }
    await htmlTransfer();
  });
}

async function transferTo(
  session: Session,
  token: string,
  amount: number,
  address: string
) {
  let tokens = <Tokens>account.values.values.get(token)!;
  tokens.value = tokens.value.slice(0, amount);
  const asset = <Asset>tokens;
  let assets_transfer = new Assets({ token: token, asset: asset });
  let transaction;
  let receipt;
  let status;
  let error;
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


