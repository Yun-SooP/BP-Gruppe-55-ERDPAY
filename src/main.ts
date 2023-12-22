import './style.css'
import { setupSession } from './setup_session.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="https://avatars.githubusercontent.com/u/45182026?s=200&v=4" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>erdPay</h1>
    <div class="card">
      <button id="privatekey" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupSession(document.querySelector<HTMLButtonElement>('#privatekey')!)
