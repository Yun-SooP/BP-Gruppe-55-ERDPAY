import "./style.css";
import { setupClient } from "./setup_client.ts";
import { Address } from "@polycrypt/erdstall/ledger";
import { Client } from "@polycrypt/erdstall";
import { widget } from "./widget.ts";
import { getTokenIDs, makeTokensList, setWindowHeight} from "./utils.ts";

let div_balanceWindow: HTMLDivElement;
let div_address: HTMLDivElement;
let h1_title: HTMLHeadingElement;
let div_balanceWindowContainer: HTMLDivElement;
let btn_return: HTMLButtonElement;
let logo_return: HTMLButtonElement;

export async function htmlBalanceForGuest(
  div_widget: HTMLDivElement,
  address: string
) {
  div_widget.innerHTML = `
  <div class = "balance-window-container l-balance-window-container first-layer-window">

    <div class="widget-header">
      <button class="goback-button">
          <i class="fa-solid fa-angle-left"></i>
      </button>
      <img 
        class = "erdstall-logo"
        src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" 
        alt="TypeScript" 
      />
    </div>
    <h1 class="l-balance-title">Balance</h1>
    <div class="balance-window-container__address"></div>
    <div class="balance-window l-balance-window second-layer-window"></div>
    <div id="balance"></div>
    
  </div>
  `;

  //Selecting HTML Elements
  btn_return = document.querySelector<HTMLButtonElement>(".goback-button")!;
  logo_return = document.querySelector<HTMLButtonElement>(".erdstall-logo")!;

  //Used in viewBalance() to change the content

  let client;
  try {
    client = await setupClient();
  } catch (error) {
    alert(error);
    return;
  }
  // const div_balance = document.querySelector<HTMLDivElement>("#balance")!;
  // htmlBalance(div_balance, address, client!);

  //Used in viewBalance() to change the content
  div_balanceWindowContainer = document.querySelector<HTMLDivElement>(
    ".balance-window-container"
  )!;
  div_balanceWindow = document.querySelector<HTMLDivElement>(
    ".balance-window-container .balance-window"
  )!;
  div_address = document.querySelector<HTMLDivElement>(
    ".balance-window-container__address"
  )!;
  h1_title = document.querySelector<HTMLHeadingElement>(
    ".balance-window-container h1"
  )!;
  viewBalance(client!, address);

  btn_return.addEventListener("click", () => widget(div_widget));
  logo_return.addEventListener("click", () => widget(div_widget));
}

/**
 * Function to change to the HTML of balance viewer.
 * @param html_widget Main body of widget
 * @param address account address for balance check
 * @param session optional parameter, if a session already exists, use this session instead of creating a new client
 */
export async function htmlBalance(
  div_balance: HTMLDivElement,
  address: string,
  client: Client
) {
  div_balance.innerHTML = `
    <div class="balance-window-container__address"></div>
    <div class="balance-window l-balance-window second-layer-window"></div>
  `;

  //Used in viewBalance() to change the content

  div_balanceWindowContainer = document.querySelector<HTMLDivElement>(
    ".transfer-window-container"
  )!;
  div_balanceWindow = document.querySelector<HTMLDivElement>(
    ".transfer-window-container .balance-window"
  )!;
  div_address = document.querySelector<HTMLDivElement>(
    ".balance-window-container__address"
  )!;
  h1_title = document.querySelector<HTMLHeadingElement>(
    ".transfer-window-container h1"
  )!;

  viewBalance(client, address);
}

/**
 * Function to display current assets of the given address.
 * @param client Client to be used for the Erdstall connection
 * @param input Address to view the balance of
 * @param lbl_balance HTML body to display the balance to
 * @returns arrays with token names, ids and amounts of the tokens
 */
async function viewBalance(client: Client, address: string) {
  const account = await client.getAccount(Address.fromString(address));
  const entries = Array.from(account!.values.values.entries());

  transformToTokenListWindow(address);

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

  select_tokens.options.length = 0;

  makeTokensList(select_tokens, select_amount, entries);

  //Make select_id, if a token is selected
  const div_id = document.querySelector<HTMLSelectElement>(
    ".balance-window__id-list"
  )!;

  select_tokens.addEventListener("change", () => {
    //move spans to left
    document.querySelector<HTMLSpanElement>(
      ".balance-window header span:first-child"
    )!.style.marginLeft = "30px";
    document.querySelector<HTMLSpanElement>(
      ".balance-window header span:nth-child(2)"
    )!.style.marginLeft = "200px";
    const span_id = document.querySelector<HTMLSpanElement>(
      ".balance-window header span:last-child"
    )!;
    span_id.style.marginLeft = "70px";
    span_id.style.color = "rgba(255, 255, 255, 0.7)";

    //make id-list visible
    div_id.classList.remove("invisible-balance-window__id-list");
    div_id.classList.add("visible-balance-window__id-list");
    const selectedIds = getTokenIDs(account, select_tokens.value);

    //reset id list
    div_id.innerHTML = ``;
    //fill id-list
    for (let i = 0; i < selectedIds.length; i++) {
      const span = document.createElement("span");
      span.classList.add("token-id", "third-layer-window");

      const tokenIDString = selectedIds[i] + "";
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
      div_id.appendChild(span);
    }
  });
}

/**
 * Function to display token list
 * @param input Account address
 */
function transformToTokenListWindow(address: string) {
  // balance_for_guest wildow height changer
  if (div_balanceWindowContainer.className != "transfer-window-container l-transfer-window-container first-layer-window"){
    setWindowHeight(div_balanceWindowContainer, 550 );
  }
  div_balanceWindow.style.height = "270px";
  // div_balanceWindow.style.width = "450px";
  h1_title.textContent = "Balance of";
  div_address.innerHTML = `<span>${address}</span> <button class="copy-button"><i class="fa-regular fa-copy"></i></button>`;
  div_address.classList.add(
    "second-layer-window",
    "visible-balance-window__address"
  );
  div_balanceWindow.innerHTML = `

      <h2 class="l-balance-instruction">To see the ID, please select the corresponding token</h2>
      <header class="token-list-header">
          <span>Available Tokens</span>
          <span>amount</span>
          <span>IDs</span>
      </header>

      <div class="list-container">
          <div class="token-list">
              <select class="token-list__tokens" size = "5"></select>
              <select class="token-list__amount" disabled size = "5"></select>
          </div>
          <div class="balance-window__id-list invisible-balance-window__id-list"></div>
      </div>
      
    `;
  const btn_copy = document.querySelector<HTMLButtonElement>(".copy-button");
  btn_copy!.addEventListener("click", async () => {
    await navigator.clipboard.writeText(address);
  });
}
