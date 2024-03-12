import { htmlBalanceForGuest } from "./balance";
import { htmlCreateSession, htmlDashboard } from "./dashboard";
import { Session } from "@polycrypt/erdstall";
import * as utils from "./utils";

let session : Session | undefined;
let privateKey : string | undefined;

/**
 * Function to display selection between transfer and view balance.
 * @param div_widget HTML element to display to
 */
export function widget(div_widget: HTMLDivElement) {

  div_widget.innerHTML = `
    <div class="main-window l-main-window first-layer-window">

    <div class="tooltip l-main-tooltip">        
            <i class="fa-solid fa-circle-info tooltip tooltip-icon"></i> 
            <span class="tooltiptext-bottom">Tooltip text</span> 
    </div>

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
      
      <button type="button" class="view-balance-btn">View Any Balance</button>
      
    </form>
    </div>
    `;

  const btn_transfer = document.querySelector(
    ".main-window__form .transfer-btn"
  );
  
  btn_transfer?.addEventListener("click", () => {
    if (session && privateKey){
      htmlDashboard(div_widget, session, privateKey);
    } else {
      htmlCreateSession(div_widget);
    }
  });

  const txt_balanceAddress = document.querySelector<HTMLInputElement>(
    ".main-window__form input[type='text']"
  )!;
  const btn_balance = document.querySelector<HTMLButtonElement>(
    ".main-window__form .view-balance-btn"
  )!;
  btn_balance.addEventListener("click", () => {
    const valid = utils.checkBalanceAddress(
      txt_balanceAddress.value,
      "errBalanceAccAddr",
      "inputAddress"
    );
    if (!valid) {
      return;
    }
    htmlBalanceForGuest(div_widget, txt_balanceAddress.value);
  });

  txt_balanceAddress.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_balance.click();
    }
  });
}

// change the inner HTML of the HTML div element "app" to the main interface
widget(document.querySelector<HTMLDivElement>("#app")!);

export function login(sessionForLogin: Session, privateKeyForLogin: string){
  session = sessionForLogin;
  privateKey = privateKeyForLogin;
}
export function logout(){
  session = undefined;
  privateKey = undefined;
  widget(document.querySelector<HTMLDivElement>("#app")!);
}