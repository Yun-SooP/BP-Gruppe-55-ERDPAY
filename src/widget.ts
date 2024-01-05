import { htmlBalance } from "./balance";
import { htmlCreateSessionForTransfer } from "./transfer";

export function widget(html: HTMLDivElement) {
  html.innerHTML = `
    <div class="main-window">
    <img
        class="erdstall-logo"
        src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
        alt="TypeScript"
    />
    <header class="main-window__header">
        <h1>Welcome to ErdPay</h1>
        <p>Select an action to perform</p>
    </header>

    <form class="main-window__form">
        <input type="button" value="View Balance" />
        <input type="button" value="Transfer" />
    </form>
    </div>
    `;

  const transfer = document.querySelector('input[value="Transfer"]');
  transfer?.addEventListener("click", () => {
    htmlCreateSessionForTransfer(html);
  });

  const balance = document.querySelector('input[value="View Balance"]');
  balance?.addEventListener("click", () => {
    htmlBalance(html);
  });
}

export function makeWidgetButton() {
  const html = document.querySelector<HTMLDivElement>("#app")!;
  html.innerHTML = `
    <div>
        <button id="mainButton" type="button">
            <img src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" />
        </button>
    </div>
    `;
  const btn = document.querySelector("#mainButton");
  btn?.addEventListener("click", () => {
    widget(html);
  });
}

makeWidgetButton();
