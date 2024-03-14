import "./style.css";
import { setupClient } from "./setup_client.ts";
import { Address } from "@polycrypt/erdstall/ledger";
import { Client } from "@polycrypt/erdstall";
import { widget } from "./widget.ts";
import * as utils from "./utils";

let div_balanceWindow: HTMLDivElement;
let div_address: HTMLDivElement;
let h1_title: HTMLHeadingElement;
let div_balanceWindowContainer: HTMLDivElement;
let btn_return: HTMLButtonElement;
let logo_return: HTMLButtonElement;


/**
 * Renders the balance viewer interface for guest users within the specified HTMLDivElement.
 * This function sets up the initial HTML structure and configures event listeners for navigation.
 * It initializes the Erdstall client and invokes the viewBalance function to display the address's balance.
 *
 * @param div_widget The HTMLDivElement where the balance viewer interface will be injected.
 * @param address The address whose balance information is to be displayed.
 * @returns Nothing explicitly, but performs asynchronous operations to set up and display the balance viewer.
 */
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
    <div id="balance-content"></div>
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
  // Change content of balance to empty box if there are no tokens to see
  const account = await client!.getAccount(Address.fromString(address));
  const div_balanceContent = document.querySelector<HTMLDivElement>("#balance-content")!;
  if (account.values.values.size == 0) {
    div_balanceContent.innerHTML = `
      <div class = "transfer-window l-transfer-window second-layer-window">
        <p>You have no token available.</p>
      </div>
    `;
  } else {
    div_balanceContent.innerHTML = `
    <div class="balance-window-container__address"></div>
    <div class="balance-window l-balance-window second-layer-window"></div>
    `;
  }

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
  await viewBalance(client!, address);

  btn_return.addEventListener("click", () => widget(div_widget));
  logo_return.addEventListener("click", () => widget(div_widget));
}

/**
 * Configures and injects the HTML content structure for the balance viewer into the provided div element.
 * The function sets up the necessary containers and invokes the viewBalance function to populate them
 * with the actual balance data for the given address using the provided client.
 *
 * @param div_balance The HTMLDivElement that serves as the container for the balance viewer content.
 * @param address The blockchain address for which the balance will be checked and displayed.
 * @param client The Erdstall client instance to use for retrieving balance information.
 */
export async function htmlBalance(
  div_balance: HTMLDivElement,
  address: string,
  client: Client
) {
  const account = await client.getAccount(Address.fromString(address));
  if (account.values.values.size == 0) {
    div_balance.innerHTML = `
      
        <div class = "transfer-window l-transfer-window second-layer-window">
          <p>You have no token available.</p>
        </div>
      
    `;
  } else {
    div_balance.style.height = "340px";
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
}

/**
 * Retrieves and displays the balance of assets for a given address using the specified client to connect to Erdstall.
 * It populates the token list and amount elements in the UI and sets up an interactive selection list for token IDs.
 * The function also handles UI adjustments such as scrolling synchronization and visibility toggles for the ID list.
 *
 * @param client The Erdstall Client instance used to establish a connection and retrieve account information.
 * @param address The address whose balance will be retrieved and displayed.
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
  utils.syncScrolls(select_tokens, select_amount);

  select_tokens.options.length = 0;
  utils.makeTokensList(select_tokens, select_amount, entries);

  //Make select_id, if a token is selected
  const div_id = document.querySelector<HTMLDivElement>(
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

    //change color of selecteed token color
    utils.selectedTokenToBlue(select_tokens);

    //make id-list visible
    div_id.classList.remove("invisible-balance-window__id-list");
    div_id.classList.add("visible-balance-window__id-list");
    const selectedIds = utils.getTokenIDs(account, select_tokens.value);

    utils.makeTokenIDsList(div_id, selectedIds);
  });
}

/**
 * Transforms the user interface to display a list of tokens associated with the provided address.
 * The function adjusts the display based on whether the view is for a guest or a dashboard user,
 * sets the balance window height, and populates the address field with copy functionality.
 *
 * @param address The address for which the token list will be displayed.
 */
function transformToTokenListWindow(address: string) {
  // balance_for_guest window height changer
  if (
    div_balanceWindowContainer.className !=
    "transfer-window-container l-transfer-window-container first-layer-window"
  ) {
    utils.setWindowHeight(div_balanceWindowContainer, 550);
    h1_title.textContent = "Balance of";
  } else {
    //header for dashboard balance section is different to guest balance.
    h1_title.textContent = "My Balance";
  }
  div_balanceWindow.style.height = "270px";

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
              <select class="token-list__tokens" size = "5" id="tokenSelector"></select>
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
