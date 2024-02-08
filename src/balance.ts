import "./style.css";
import { setupClient } from "./setup_client.ts";
import { Address } from "@polycrypt/erdstall/ledger";
import { Client } from "@polycrypt/erdstall";
import { widget } from "./widget.ts";
import { getTokenIDs, makeTokensList, errorHighlight, errorMessageSpan } from "./utils.ts";

let html_widgetCopy: HTMLDivElement;
let div_balanceWindow: HTMLDivElement;
let div_address: HTMLDivElement;
let h1_title: HTMLHeadingElement;
let div_balanceWindowContainer: HTMLDivElement;
let btn_return: HTMLButtonElement;
let logo_return: HTMLButtonElement;

/**
 * Function to change to the HTML of balance viewer.
 * @param html_widget Main body of widget
 */

export async function htmlBalance(html_widget: HTMLDivElement) {
  html_widgetCopy = html_widget;
  html_widget.innerHTML = `
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

    <div class="balance-window l-balance-window second-layer-window"  id="balanceAddressEnterWindow">
      <form class="balance-window__address-form">
        <span id="errBalanceAccAddr"></span>
        <input type="text" placeholder="account address" spellcheck="false" id="inputAddress"/>
        <button type="button" class="view-balance-btn">
          View Balance
        </button>
      </form>

    </div>
  </div>
  `;

  // Try to set up client
  let client;
  try {
    client = await setupClient();
  } catch (error) {
    alert(error);
  }

  //Selecting HTML Elements
  const btn_viewBalance = document.querySelector<HTMLButtonElement>(
    ".balance-window__address-form .view-balance-btn"
  )!;
  const txt_balanceAddress = document.querySelector<HTMLInputElement>(
    ".balance-window__address-form input[type='text']"
  )!;
  btn_return = document.querySelector<HTMLButtonElement>(".goback-button")!;
  logo_return = document.querySelector<HTMLButtonElement>(".erdstall-logo")!;

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

  //Adding Eventlistners
  btn_viewBalance.addEventListener("click", async () =>
    viewBalance(client!, txt_balanceAddress)
  );
  txt_balanceAddress.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_viewBalance.click();
    }
  });
  btn_return.addEventListener("click", () => widget(html_widget));
  logo_return.addEventListener("click", () => widget(html_widget));
}

/**
 * Function to display current assets of the given address.
 * @param client Client to be used for the Erdstall connection
 * @param input Address to view the balance of
 * @param lbl_balance HTML body to display the balance to
 * @returns arrays with token names, ids and amounts of the tokens
 */
async function viewBalance(client: Client, input: HTMLInputElement) {
  try {
    if (input.value.length != 42) throw new Error("invalid address");

    const account = await client.getAccount(Address.fromString(input.value));
    const entries = Array.from(account!.values.values.entries());

    transformToTokenListWindow(input);

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

    makeTokensList(select_tokens, select_amount, entries)

    //Make select_id, if a token is selected
    const select_id = document.querySelector<HTMLSelectElement>(
      ".balance-window__id-list"
    )!;

    select_tokens.addEventListener("change", () => {
      //move spans to left
      document.querySelector<HTMLSpanElement>(
        ".balance-window header span:first-child"
      )!.style.marginLeft = "85px";
      document.querySelector<HTMLSpanElement>(
        ".balance-window header span:nth-child(2)"
      )!.style.marginLeft = "110px";
      const span_id = document.querySelector<HTMLSpanElement>(
        ".balance-window header span:last-child"
      )!;
      span_id.style.marginLeft = "50px";
      span_id.style.color = "rgba(255, 255, 255, 0.7)";

      select_id.options.length = 0;

      //make id-list visible
      select_id.classList.remove("invisible-balance-window__id-list");
      select_id.classList.add("visible-balance-window__id-list");
      const selectedIds = getTokenIDs(account, select_tokens.value);

      //fill id-list
      for (let i = 0; i < selectedIds.length; i++) {
        const option = document.createElement("option");

        option.text = selectedIds[i].toString();
        //option.value = null; You Can link Value of ID here
        select_id.add(option);
      }
    });
  } catch (error) {
    // alert(
    //   "Please enter a valid address. The address must be in hex and 40 characters long."
    // );
    
    document.getElementById('balanceAddressEnterWindow')!.style.height = "210px";
    let msg = `
    <span class="error-message-span">
      Please enter a valid address. <br> The address must be in hex and 40 characters long.
    </span>`
    errorHighlight('inputAddress');
    errorMessageSpan('errBalanceAccAddr', msg);
  }
}


/**
 * Function to display token list
 * @param input Account address
 */
function transformToTokenListWindow(input: HTMLInputElement) {
  btn_return = document.querySelector<HTMLButtonElement>(".goback-button")!;
  btn_return.addEventListener("click", () => htmlBalance(html_widgetCopy));

  div_balanceWindowContainer.style.height = "580px";
  div_balanceWindow.style.height = "270px";
  // div_balanceWindow.style.width = "450px";
  h1_title.textContent = "Balance of";
  div_address.innerHTML = `<span>${input.value}</span> <button class="copy-button"><i class="fa-regular fa-copy"></i></button>`;
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
          <select class="balance-window__id-list invisible-balance-window__id-list" size = "5"></select>
      </div>
      
    `;
  const btn_copy = document.querySelector<HTMLButtonElement>(".copy-button");
  btn_copy!.addEventListener("click", () => {
    navigator.clipboard.writeText(input.value);
  });
}