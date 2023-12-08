import './style.css'
import { setupClient } from './setup_client.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://github.com/perun-network/erdstall-ts-sdk" target="_blank">
      <img src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>erdPay</h1>
    <div class="card">
      <button id="balance" type="button"></button>
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

setupClient(document.querySelector<HTMLButtonElement>('#balance')!, document.querySelector<HTMLInputElement>('#address')!, document.querySelector<HTMLBodyElement>('#array')!)