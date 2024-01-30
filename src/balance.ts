import "./style.css";
import { setupClient } from "./setup_client.ts";
import { Address } from "@polycrypt/erdstall/ledger";
import { Client } from "@polycrypt/erdstall";
import { widget } from "./widget.ts";
import { Asset, Tokens } from "@polycrypt/erdstall/ledger/assets";

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
  <div class = "balance-window-container">
   
    <img 
      class = "erdstall-logo"
      src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" 
      alt="TypeScript" 
    />
    <button class="goback-button">
        <i class="fa-solid fa-angle-left"></i>
    </button>


    <h1>Balance</h1>

    <div class="address"></div>

    <div class="balance-window">

      <!-- <h2>Enter the address of the account to see the balance</h2>  (not visible)-->
      <form class="balance-window__address-form">
        <input type="text" placeholder="account address" />
        <input type="button" value="View Balance" />
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
    ".balance-window__address-form input[type='button']"
  )!;
  const txt_balanceAddress = document.querySelector<HTMLInputElement>(
    ".balance-window__address-form input[type='text']"
  )!;
  btn_return = document.querySelector<HTMLButtonElement>(".goback-button")!;

  //Used in viewBalance() to change the content

  div_balanceWindowContainer = document.querySelector<HTMLDivElement>(
    ".balance-window-container"
  )!;
  div_balanceWindow = document.querySelector<HTMLDivElement>(
    ".balance-window-container .balance-window"
  )!;
  div_address = document.querySelector<HTMLDivElement>(
    ".balance-window-container .address"
  )!;
  h1_title = document.querySelector<HTMLHeadingElement>(
    ".balance-window-container h1"
  )!;

  //Adding Eventlistners
  btn_viewBalance.addEventListener("click", async () =>
    viewBalance(client!, txt_balanceAddress)
  );
  btn_return.addEventListener("click", () => widget(html_widget));

  logo_return = document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => widget(html_widget));

  // let tokens: string[], ids: number[][], amounts: number[];

  // Event listener for the buttons to return, to view the balance and to select Token to view
  // btn_viewBalance.addEventListener("click", async () => {
  //   txt_amount!.innerHTML = "";
  //   txt_ids!.innerHTML = "";
  //   [tokens, ids, amounts] = await viewBalance(
  //     client!,
  //     txt_balanceAddress,
  //     select_tokens
  //   );
  // });

  // select_tokens.addEventListener("change", () => {
  //   const index = tokens.indexOf(select_tokens.value);
  //   txt_ids!.innerHTML = ids[index].toString();
  //   txt_amount!.innerHTML = amounts[index].toString();
  // });
}

/**
 * Function to display current assets of the given address.
 * @param client Client to be used for the Erdstall connection
 * @param input Address to view the balance of
 * @param lbl_balance HTML body to display the balance to
 * @returns arrays with token names, ids and amounts of the tokens
 */
async function viewBalance(
  client: Client,
  input: HTMLInputElement
): Promise<[string[], number[][], number[]]> {
  try {
    //조건 이걸로 충분한가?? (진짜 몰라서 물어보는거) -재광
    if (input.value.length != 42) throw new Error("invalid address");

    transformToTokenListWindow(input);

    btn_return.addEventListener("click", () => htmlBalance(html_widgetCopy));
    logo_return.addEventListener("click", () => widget(html_widgetCopy));

    const select_tokens = document.querySelector<HTMLSelectElement>(
      ".token-list__tokens"
    )!;
    const select_amount = document.querySelector<HTMLSelectElement>(
      ".token-list__amount"
    )!;

    //Synchronize scroll of select_tokens and select_amount
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

    const account = await client.getAccount(Address.fromString(input.value));
    const entries = Array.from(account!.values.values.entries());

    //리턴 할 필요 없으면 지워도 되는것들
    const tokens: string[] = [];
    const amounts: number[] = [];

    select_tokens.options.length = 0;
    const ids: number[][] = [];

    for (let i = 0; i < entries.length; i++) {
      const option = document.createElement("option");
      const asset = entries[i];
      option.text =
        asset[0].substring(0, 8) + "......" + asset[0].substring(36, 42);
      // TODO: design
      // option.onmouseover()
      option.value = asset[0];
      select_tokens.add(option);

      const option_amount = document.createElement("option");
      option_amount.value = asset[0]; //actually not used, because select_amount disabled.
      option_amount.text = (<Tokens>asset[1]).value.length + "";
      select_amount.add(option_amount);

      ids.push(getIds(asset));
      //리턴 할 필요 없다면 없어도 되는것들
      tokens.push(asset[0]);
      amounts.push((<Tokens>asset[1]).value.length);
    }

    //Make select_id, if a token is selected
    const select_id = document.querySelector<HTMLSelectElement>(".id-list")!;

    select_tokens.addEventListener("change", () => {
      //move spans to left
      document.querySelector<HTMLSpanElement>(
        ".balance-window header span:first-child"
      )!.style.marginLeft = "100px";
      document.querySelector<HTMLSpanElement>(
        ".balance-window header span:nth-child(2)"
      )!.style.marginLeft = "115px";
      const span_id = document.querySelector<HTMLSpanElement>(
        ".balance-window header span:last-child"
      )!;
      span_id.style.marginLeft = "30px";
      span_id.style.color = "rgba(255, 255, 255, 0.7)";

      select_id.options.length = 0;

      //make id-list visible
      select_id.classList.remove("invisible-id-list");
      select_id.classList.add("visible-id-list");
      const index = tokens.indexOf(select_tokens.value);
      const selectedIds = ids[index];

      //fill id-list
      for (let i = 0; i < selectedIds.length; i++) {
        const option = document.createElement("option");

        option.text = selectedIds[i].toString();
        //option.value = null; You Can link Value of ID here
        select_id.add(option);
      }
    });

    return [tokens, ids, amounts]; //이건 미래에 쓸 곳이 따로 또 있어서 리턴하는건가??
  } catch (error) {
    alert(
      "Please enter a valid address. The address must be in hex and 40 characters long."
    );
    throw error;
  }
}

function transformToTokenListWindow(input: HTMLInputElement) {
  div_balanceWindowContainer.style.height = "580px";
  div_balanceWindow.style.height = "270px";
  // div_balanceWindow.style.width = "450px";
  h1_title.textContent = "Balance of";
  div_address.innerHTML = `<span>${input.value}</span> <button class="copy-button"><i class="fa-regular fa-copy"></i></button>`;
  div_address.classList.add("address-in-token-list-window");
  div_balanceWindow.innerHTML = `

      <h2>To see the ID, please select the corresponding token</h2>
      <header>
          <span>Available Tokens</span>
          <span>amount</span>
          <span>IDs</span>
      </header>

      <div class="list-container">
          <div class="token-list">
              <select class="token-list__tokens" size = "5"></select>
              <select class="token-list__amount" disabled size = "5"></select>
          </div>
          <select class="id-list invisible-id-list" size = "5"></select>
      </div>
      
    `;
  const btn_copy = document.querySelector<HTMLButtonElement>(".copy-button");
  btn_copy!.addEventListener("click", () => {
    navigator.clipboard.writeText(input.value);
  });
}

/**
 * Function to read ids of a token into an array
 * @param asset Token to read the ids from
 * @returns Array with ids of given Token
 */
function getIds(asset: [string, Asset]): number[] {
  const innerIds: number[] = [];
  for (const id of asset[1].toJSON()) {
    innerIds.push(parseInt(id));
  }
  return innerIds;
}
