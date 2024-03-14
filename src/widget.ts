import { htmlBalanceForGuest } from "./balance";
import { htmlCreateSession, htmlDashboard } from "./dashboard";
import { Session } from "@polycrypt/erdstall";
import {createInfoBox } from "./utils";
import * as utils from "./utils";

let session : Session | undefined;
let privateKey : string | undefined;

/**
 * Renders the main widget interface which allows the user to select between accessing the dashboard
 * or viewing the balance of an account by providing its address.
 *
 * @param div_widget The HTMLDivElement where the widget will be displayed.
 */
export function widget(div_widget: HTMLDivElement) {
// Set the widget's inner HTML to display the main menu with two primary actions
  div_widget.innerHTML = `
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
      
      <button type="button" class="view-balance-btn">View Any Balance</button>
      
    </form>
    </div>
    `;
    // Generate the informational content for the main window
    const content =`
      <h1 class="erdpay-h1"> Hi! </h1>
      <p class="erdpay-p"> You can start viewing any account you like by putting in the address below <br>
          or you can checkout more individual features on our dashhboard! </p>
    `
    // Create the info box and append it to the main window
    createInfoBox(document.querySelector<HTMLElement>(".main-window")!, content);

  const btn_transfer = document.querySelector(
    ".main-window__form .transfer-btn"
  );
  
  btn_transfer?.addEventListener("click", async () => {
    // If a session and private key exist, display the dashboard, otherwise prompt for session creation
    if (session && privateKey){
      await htmlDashboard(div_widget, session, privateKey);
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

  // Add an event listener to the view balance button for displaying balance of a given address
  btn_balance.addEventListener("click", async () => {
    // Validate the address input before proceeding
    const valid = utils.checkBalanceAddress(
      txt_balanceAddress.value,
      "errBalanceAccAddr",
      "inputAddress"
    );
    if (valid) {
      // If the address is valid, display the balance for the given address
      await htmlBalanceForGuest(div_widget, txt_balanceAddress.value);
    }
  });

  // Add an event listener to the balance address input field to trigger balance view on Enter keypress
  txt_balanceAddress.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_balance.click();
    }
  });
}

// change the inner HTML of the HTML div element "app" to the main interface
widget(document.querySelector<HTMLDivElement>("#app")!);

/**
 * Log-in with session and private key.
 * Once logged-in, the user don't have to log-in again for dashboard.
 * @param sessionForLogin session for login
 * @param privateKeyForLogin private key for login
 */
export function login(sessionForLogin: Session, privateKeyForLogin: string){
  session = sessionForLogin;
  privateKey = privateKeyForLogin;
}

/**
 * Log-out and display the start page.
 */
export function logout(){
  session = undefined;
  privateKey = undefined;
  widget(document.querySelector<HTMLDivElement>("#app")!);
}