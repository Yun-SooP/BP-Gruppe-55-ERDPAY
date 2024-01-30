import { htmlBalance } from "./balance";
import { htmlCreateSessionForTransfer } from "./transfer";

/**
 * Function to display selection between transfer and view balance.
 * @param html_widget HTML element to display to
 */
export function widget(html_widget: HTMLDivElement) {
  html_widget.innerHTML = `
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

  const btn_transfer = document.querySelector('input[value="Transfer"]');
  btn_transfer?.addEventListener("click", () => {
    htmlCreateSessionForTransfer(html_widget);
  });

  const btn_balance = document.querySelector('input[value="View Balance"]');
  btn_balance?.addEventListener("click", () => {
    htmlBalance(html_widget);
  });
}

/**
 * Function to display startpage of the widget.
 */
export function makeWidgetButton() {
  const html_dummy = document.querySelector<HTMLDivElement>("#app")!;
  html_dummy.innerHTML = `
    

    <div class="dummy">

        <button class="main-button" type="button">
            <img class="erdstall-logo" src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" />
        </button>

        
    </div>
    `;
  const btn_main = document.querySelector(".main-button:last-child");
  btn_main?.addEventListener("click", () => {
    widget(html_dummy);
  });
}

makeWidgetButton();
