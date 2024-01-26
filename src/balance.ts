import "./style.css";
import { setupClient } from "./setup_client.ts";
import { Address } from "@polycrypt/erdstall/ledger";
import { Client } from "@polycrypt/erdstall";
import { widget } from "./widget.ts";
import { Asset, Tokens } from "@polycrypt/erdstall/ledger/assets";

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

    <h1>Balance</h1>
      
    <div class = "group">
      
      <div class="select">
        <select size="5" name="tokens" id="" class="balance-window__select"> </select>

        <form class = "balance-window__form">
          
            <label class = "label">
              <label id= "IDs"> IDs: <br></label>
              <span id= "txt_ids"></span>
            </label>

            <label class = "label">
              <label id= "Amount"> Amount: <br></label>
              <span id= "txt_amount"></span>
            </label>
        </form>
      </div>

      <form class = "balance-window__form">
        <input type="text" placeholder="account address" />
        <input type="button" value="view balance" />
        
        
        
          
    
        
        
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

  const btn_viewBalance = document.querySelector<HTMLButtonElement>(
    ".balance-window__form input[type='button']"
  )!;
  const txt_balanceAddress = document.querySelector<HTMLInputElement>(
    ".balance-window__form input[type='text']"
  )!;

  const txt_ids = document.querySelector<HTMLSpanElement>("#txt_ids")!;
  const txt_amount = document.querySelector<HTMLSpanElement>("#txt_amount")!;
  const select_tokens = document.querySelector<HTMLSelectElement>(".balance-window__select")!;

  let tokens: string[], ids: number[][], amounts: number[];


  // Event listener for the buttons to return, to view the balance and to select Token to view
  btn_viewBalance.addEventListener("click", async () => {
    txt_amount!.innerHTML= '';
    txt_ids!.innerHTML = '';
    [tokens, ids, amounts] = await viewBalance(client!, txt_balanceAddress, select_tokens);
  });

  select_tokens.addEventListener('change', () => {
    const index = tokens.indexOf(select_tokens.value);
    txt_ids!.innerHTML = ids[index].toString();
    txt_amount!.innerHTML = amounts[index].toString();

  })

  const btn_return =
    document.querySelector<HTMLButtonElement>(".goback-button")!;
  btn_return.addEventListener("click", () => widget(html_widget));
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
  input: HTMLInputElement,
  select_tokens: HTMLSelectElement
) : Promise<[string[], number[][], number[]]> {
  try {
    if (input.value.length != 42) throw new Error("invalid address");
    const account = await client.getAccount(Address.fromString(input.value));
    const entries = Array.from(account!.values.values.entries());
    const tokens: string[] = [];
    const ids: number[][] = [];
    const amounts: number[] = [];
    select_tokens.options.length = 0;
    
    for (let i = 0; i < entries.length; i++) {
      const option = document.createElement("option");
      const asset = entries[i];
      option.text = asset[0].substring(0,6) + "..." + asset[0].substring(38,42);
      // TODO: design
      // option.onmouseover()
      option.value = asset[0];
      select_tokens.add(option)
      tokens.push(asset[0])
      amounts.push((<Tokens>asset[1]).value.length);
      ids.push(getIds(asset));
    }
    
    return [tokens, ids, amounts]
  } catch (error) {
    alert("Please enter a valid address. The address must be in hex and 40 characters long.");
    throw(error);
  }
}

/**
 * Function to read ids of a token into an array
 * @param asset Token to read the ids from
 * @returns Array with ids of given Token
 */
function getIds (asset: [string, Asset]) : number[] {
  const innerIds: number[] = [];
  for (const id of asset[1].toJSON()) {
    innerIds.push(parseInt(id));
  }
  return innerIds;
}
