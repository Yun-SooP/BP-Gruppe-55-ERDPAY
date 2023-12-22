import './style.css'
import { setupClient } from './setup_client.ts'
import { Address} from "@polycrypt/erdstall/ledger";
import { Client } from '@polycrypt/erdstall';
import { start } from './widget.ts';

/**
 * export function to change to balance viewer
 * @param html main body of widget
 */
export async function goToBalance(html : HTMLElement) {
  html.innerHTML = `
  <div>
    <a href="https://github.com/perun-network/erdstall-ts-sdk" target="_blank">
      <img src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>erdPay</h1>
    <div class="card">
      <button id="balance" type="button"></button>
      <button id="back" type="button"></button>
    </div>
    <div>
        <label for="address">Address:</label>
        <input type="text" id="address" name="address">
    </div>
    <div>
        <label id="array"></label>
    </div>
  </div>
  `
  const client = await setupClient()

  const back = document.querySelector<HTMLButtonElement>('#back')!
  const button = document.querySelector<HTMLButtonElement>('#balance')!
  var input = document.querySelector<HTMLInputElement>('#address')!
  const array = document.querySelector<HTMLBodyElement>('#array')!

  button.innerHTML = `View Balance`
  button.addEventListener('click', () => {
    viewBalance(client, input, array)
  })

  back.innerHTML = `Return`
  back.addEventListener('click', () => 
    start()
  )
}

/**
 * Function to display current assets of the given address
 */
async function viewBalance(client : Client, input : HTMLInputElement, array : HTMLBodyElement) {
  try {
    var account = await client.getAccount(Address.fromString(input.value))
    let entries = Array.from(account.values.values.entries())
    let assets = ""
    for (let i = 0; i < entries.length; i++) {
      let asset = entries[i]
      assets += "Token: " + asset[0] + " IDs:"
      for (const id of asset[1].toJSON()){
          assets += " " + parseInt(id)
      }
      assets += "<br>"
    }
    if (entries.length == 0) array.innerHTML = "No assets"
    else array.innerHTML = assets
  } catch (error) {
    array.innerHTML = "Non valid address"
  }
}

