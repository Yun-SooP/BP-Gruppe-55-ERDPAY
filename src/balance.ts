import "./style.css";
import { setupClient } from "./setup_client.ts";
import { Address } from "@polycrypt/erdstall/ledger";
import { Client } from "@polycrypt/erdstall";
import { widget } from "./widget.ts";
import { Tokens } from "@polycrypt/erdstall/ledger/assets";

/**
 * Function to change to the HTML of balance viewer.
 * @param html_widget Main body of widget
 */

export async function htmlBalance(html_widget: HTMLDivElement) {
  html_widget.innerHTML = `
  <div class = "balance-window">
    <img 
      class = "erdstall-logo"
      src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" 
      alt="TypeScript" 
    />
    <button class="goback-button">
        <i class="fa-solid fa-angle-left"></i>
    </button>

    <header class = "balance-window__header">
      <h1>Balance</h1>
      <p>
          Enter the address of the account you want to view the balance
      </p>
    </header>

    <form class = "balance-window__form">
      <input type="text" placeholder="account address" />
      <input type="button" value="view balance" />
      
      <div class="select">
      <label id= "lbl_balance"> </label>
      </div>
    </form>
    

    
  </div>
  `;

  // Try to set up client
  let client;
  try {
    client = await setupClient();
  } catch (error) {
    alert(error);
  }

  //add eventlistners
  const btn_viewBalance = document.querySelector<HTMLButtonElement>(
    ".balance-window__form input[type='button']"
  )!;
  let txt_balanceAddress = document.querySelector<HTMLInputElement>(
    ".balance-window__form input[type='text']"
  )!;
  const lbl_balance = document.querySelector<HTMLBodyElement>("#lbl_balance")!;

  btn_viewBalance.addEventListener("click", () => {
    viewBalance(client!, txt_balanceAddress, lbl_balance);
  });

  const btn_return = document.querySelector<HTMLButtonElement>(".goback-button")!;
  btn_return.addEventListener("click", () => widget(html_widget));
}

/**
 * Function to display current assets of the given address.
 */
async function viewBalance(
  client: Client,
  input: HTMLInputElement,
  lbl_balance: HTMLBodyElement
) {
  try {
    let account = await client.getAccount(Address.fromString(input.value));
    let entries = Array.from(account.values.values.entries());
    let assets = "";
    for (let i = 0; i < entries.length; i++) {
      let asset = entries[i];
      assets +=
        "Token: " +
        asset[0] +
        " Amount: " +
        (<Tokens>asset[1]).value.length +
        " IDs:";
      for (const id of asset[1].toJSON()) {
        assets += " " + parseInt(id);
      }
      assets += "<br>";
    }
    if (entries.length == 0) lbl_balance.innerHTML = "No assets";
    else lbl_balance.innerHTML = assets;
  } catch (error) {
    alert(error);
  }
}
