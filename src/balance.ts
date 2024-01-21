import "./style.css";
import { setupClient } from "./setup_client.ts";
import { Address } from "@polycrypt/erdstall/ledger";
import { Client } from "@polycrypt/erdstall";
import { widget } from "./widget.ts";
import { Tokens } from "@polycrypt/erdstall/ledger/assets";

/**
 * Function to change to the HTML of balance viewer.
 * @param html Main body of widget
 */

export async function htmlBalance(html: HTMLDivElement) {
  html.innerHTML = `
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
        <select size="5" name="tokens" id="" class="balance-window__select">
          <label id= "array"> </label>
          <option value = array> "2"</option>
          <option value = array> "3"</option>
          <option value = array> "4"</option>
          <option value = array> "5"</option>
          <option value = array> "6"</option>

        </select>
        <form class = "balance-window__form">
          <label class = "label">
            <label id= "IDs"> list of IDs</label>
          </label>
          <label class = "label">
            <label id= "IDs"> num of ids</label>
          </label>
        </form>
        
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
  const button = document.querySelector<HTMLButtonElement>(
    ".balance-window__form input[type='button']"
  )!;
  let input = document.querySelector<HTMLInputElement>(
    ".balance-window__form input[type='text']"
  )!;
  const array = document.querySelector<HTMLBodyElement>("#array")!;

  button.addEventListener("click", () => {
    viewBalance(client!, input, array);
  });

  const b_return = document.querySelector<HTMLButtonElement>(".goback-button")!;
  b_return.addEventListener("click", () => widget(html));
}

/**
 * Function to display current assets of the given address.
 */
async function viewBalance(
  client: Client,
  input: HTMLInputElement,
  array: HTMLBodyElement
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
    if (entries.length == 0) array.innerHTML = "No assets";
    else array.innerHTML = assets;
  } catch (error) {
    alert(error);
  }
}
