import { htmlBalance } from "./balance";
import { htmlCreateSession } from "./dashboard";
import { eventPayPopup } from "./pay";

/**
 * Function to display selection between transfer and view balance.
 * @param html_widget HTML element to display to
 */
export function widget(html_widget: HTMLDivElement) {
  html_widget.innerHTML = `
    <div class="main-window l-main-window first-layer-window">

    <img
        class="l-main-logo erdstall-logo"
        src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
        alt="TypeScript"
    />
    <header class="main-window__header l-main-window__header">
        <h1>Welcome to ErdPay</h1>
        <p>Select an action to perform</p>
    </header>

    <form class="main-window__form l-main-window__form">
        <button type="button" class="view-balance-btn">View Balance</button>
        <button type="button" class="transfer-btn">Dashboard</button>
    </form>
    </div>
    `;

  const btn_transfer = document.querySelector(
    ".main-window__form .transfer-btn"
  );
  btn_transfer?.addEventListener("click", () => {
    htmlCreateSession(html_widget);
  });

  const btn_balance = document.querySelector(
    ".main-window__form .view-balance-btn"
  );
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
        <button id="pay" type="button">
            Pay with <img class="erdstall-logo" src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" />
        </button>
        <button class="main-button" type="button">
            <img class="erdstall-logo" src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" />
        </button>
    </div>
    `;
  const btn_main = document.querySelector(".main-button");
  btn_main?.addEventListener("click", () => {
    widget(html_dummy);
  });
  const btn_pay = document.getElementById("pay");
  btn_pay?.addEventListener("click", () => 
    eventPayPopup()
  );
}

makeWidgetButton();
