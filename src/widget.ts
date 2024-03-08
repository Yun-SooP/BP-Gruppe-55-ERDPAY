import { htmlBalanceForGuest } from "./balance";
import { htmlCreateSession } from "./dashboard";
import { createToolTip } from "./tooltip";
import * as utils from "./utils";

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
      <div class='button2'>
        <button type="button" class="transfer-btn">Dashboard</button>
      </div>
      <span>or</span>
      <span id="errBalanceAccAddr"></span>
      <input type="text" placeholder="account address" spellcheck="false" id="inputAddress"/>
      <div class='button1'>
        <button type="button" class="view-balance-btn">View Any Balance</button>
      </div>
    </form>
    </div>
    `;
  const text1 = "<p> Test1 </p>";
  const text2 =
    "<p> Check out more services <br> by visiting our Dashboard! </p>";
  createToolTip(text1, "button1", "right");
  createToolTip(text2, "button2", "right");

  const btn_transfer = document.querySelector(
    ".main-window__form .transfer-btn"
  );
  btn_transfer?.addEventListener("click", () => {
    htmlCreateSession(html_widget);
  });

  const txt_balanceAddress = document.querySelector<HTMLInputElement>(
    ".main-window__form input[type='text']"
  )!;
  const btn_balance = document.querySelector<HTMLButtonElement>(
    ".main-window__form .view-balance-btn"
  )!;
  btn_balance.addEventListener("click", () => {
    const valid = utils.checkBalanceAddress(txt_balanceAddress.value, "errBalanceAccAddr" ,"inputAddress");
    if (!valid){
      utils.setWindowHeight('balanceAddressEnterWindow', 210);
      return;
    }
    htmlBalanceForGuest(html_widget, txt_balanceAddress.value);
  });

  txt_balanceAddress.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_balance.click();
    }
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
  const btn_main = document.querySelector(".main-button");
  btn_main?.addEventListener("click", () => {
    widget(html_dummy);
  });
}

makeWidgetButton();
