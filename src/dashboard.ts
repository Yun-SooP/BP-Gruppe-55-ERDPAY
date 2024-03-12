import { widget } from "./widget";
import { newSession } from "./setup_session";
import { restoreSession } from "./setup_session";
import { Session } from "@polycrypt/erdstall";
import { htmlBalance } from "./balance";
import { htmlTransfer } from "./transfer";
import { htmlMint } from "./mint";
import { login, logout } from "./widget";
import * as utils from "./utils";

export let div_dashboard: HTMLDivElement;
let session: Session;
let privateKey: string;
let current: string;

/**
 * Function to display selection between a new session and restoring old session.
 * @param html_widget HTML to display to
 */
export function htmlCreateSession(div_widget: HTMLDivElement) {
  div_dashboard = div_widget;
  div_dashboard.innerHTML = `
        <div class="session-window l-session-window first-layer-window">

          <div class="widget-header">
            <button class="goback-button">
              <i class="fa-solid fa-angle-left"></i>
            </button>
            <img
              class="erdstall-logo"
              src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
              alt="TypeScript"
            />
          </div>
        
          <header class="session-window__header l-session-window__header">
            <h1>Sign-In</h1>
            <p>
              Create a new account or <br/>
              log-in with your private key
            </p>
          </header>
  
        <form class="session-window__form l-session-window__form">

          <span id="errRestoreSession"></span>
          <input type="password" placeholder="your private key (ex. 0x1234...)" id="inputPrivateKey"/>
          <button type="button" class="restore-session-btn" >Log-in</button>
          <span>or</span>
          <span id="errNewAccount"></span>
          <button type="button" class="new-session-btn" id="newAccount">New Account</button>
          
          
        </form>
      </div>
    `;
  const btn_newSession = document.querySelector<HTMLButtonElement>(
    ".session-window__form .new-session-btn"
  )!;
  const btn_restoreSession = document.querySelector<HTMLButtonElement>(
    ".session-window__form .restore-session-btn"
    // to fix
  )!;

  const txt_previousPrivateKey = document.querySelector<HTMLInputElement>(
    ".session-window__form input[type='password']"
  )!;

  /**
   * Event listeners for going back to the main page
   */
  const logo_return =
    document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => widget(div_dashboard));

  const btn_return = document.querySelector<HTMLButtonElement>(
    ".session-window .goback-button"
  )!;
  btn_return.addEventListener("click", () => widget(div_dashboard));

  btn_newSession.addEventListener(
    "click",
    async () => await eventNewSession(div_widget)
  );

  txt_previousPrivateKey.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_restoreSession.click();
    }
  });

  //stretch window and password input, if click password input
  // txt_previousPrivateKey.addEventListener("click", () => {
  //   div_sessionWindow.style.width = "550px";
  //   txt_previousPrivateKey.style.width = "380px";
  // });

  btn_restoreSession.addEventListener(
    "click",
    async () => await eventRestoreSession(txt_previousPrivateKey.value)
  );
}

/**
 * Function for new session event.
 */
async function eventNewSession(html_widget: HTMLDivElement) {
  const newSession_ = await newSession();
  if (newSession_.message != undefined) {
    utils.displayErrorMessage(
      newSession_.message,
      "errNewAccount",
      "newAccount"
    );

    return;
  }
  session = newSession_.session!;
  privateKey = newSession_.privateKey!;
  login(session, privateKey);
  createAccount(session, privateKey, html_widget);
}

/**
 * This method creates an interface when creating a new account where the session address and the private key are displayed and can be copied.
 * @param session The session address of a newly created account
 * @param privateKey The private key of a newly created account
 * @param html_widget The widget which interface should be changed to the new interface
 */
function createAccount(
  session: Session,
  privateKey: string,
  html_widget: HTMLDivElement
) {
  const sessionAsString = session.address.toString();
  html_widget.innerHTML = `
    <div class="l-create-account-window-container create-window-account-container first-layer-window">
      <header class="create-account-window-header l-create-account-window-header"> 
        <h1> You have successfully created a new account! </h1>
        <p> You can view your account details below <br> Please make sure to keep your data private </p>
      </header>

      <div class="l-create-account-window-container-body create-account-window-container-body"> 

        <div class="l-create-account-session-address-container create-account-session-address-container"> 
          <div class="create-account-window-frame-icons">
            <i class="fa-solid fa-user"></i> 
            <p> Your address </p>
          </div>


          <div class="copy-icon-session">
             <span class="session-address">${utils.shortenString(
               sessionAsString,
               3
             )}</span>
             <i class="fa-solid fa-copy copy-button"></i>
          </div>

        </div>

        <div class="l-create-account-private-key-container create-account-private-key-container"> 
          <div class="create-account-window-frame-icons">
            <i class="fa-solid fa-key"></i> 
            <p> Your private key </p>
          </div>

          <div class="copy-icon-private-key">
             <span class="private-key">${utils.shortenString(
               privateKey,
               3
             )}</span>
             <i class="fa-solid fa-copy copy-button"></i>
          </div>
        </div>
        
      </div>
      <button type="button" class="transfer-btn"> Go to Dashboard </button>
    </div>
  `;
  const copy_button_privatekey = document.querySelector<HTMLElement>(
    ".copy-icon-private-key .fa-copy"
  )!;
  utils.copyToClipboard(privateKey, copy_button_privatekey);

  const copy_button_session = document.querySelector<HTMLElement>(
    ".copy-icon-session .fa-copy"
  )!;
  utils.copyToClipboard(sessionAsString, copy_button_session);

  const dashboard = html_widget.querySelector<HTMLButtonElement>(
    ".l-create-account-window-container .transfer-btn"
  )!;
  dashboard.addEventListener(
    "click",
    async () => await htmlDashboard(div_dashboard, session, privateKey)
  );
}

/**
 * Function for restore session event.
 * @param privateKey Private key to restore the session.
 */
async function eventRestoreSession(privateKeyForRestore: string) {
  const restoredSession = await restoreSession(privateKeyForRestore);
  const valid = utils.checkPrivateKey(
    privateKeyForRestore,
    "errRestoreSession",
    "inputPrivateKey"
  );
  if (!valid) {
    return;
  } else if (restoredSession.message != undefined) {
    // there might be unexpected errors (ex. session does not exist)
    utils.displayErrorMessage(
      restoredSession.message,
      "errRestoreSession",
      "inputPrivateKey"
    );
    return;
  }
  session = restoredSession.session!;
  privateKey = privateKeyForRestore;
  login(session, privateKey);
  await htmlDashboard(div_dashboard, session, privateKey);
}

/**
 * Function to make window for transfer and minting.
 */

export async function htmlDashboard(
  div_dashboard: HTMLDivElement,
  session: Session,
  privateKey: string
) {
  div_dashboard.innerHTML = `
    <div class="transfer-window-container l-transfer-window-container first-layer-window">

        <div id="loading"></div>

        <div class="widget-header">
            <button class="goback-button">
              <i class="fa-solid fa-angle-left"></i>
            </button>

            <div class="l-tab">
              <div id="balanceTab" class="tab selected-tab">My Balance</div>
              <div id="transferTab" class="tab">Transfer</div>
              <div id="mintTab" class="tab">Mint</div>
            </div>
            <img
              class="erdstall-logo"
              src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
              alt="TypeScript"
            />
        </div>
  
        <h1 id="current-tab-label" class="l-transfer-title">Transfer</h1>
  
        <div id="current-tab"></div>

        <div class="transfer-footer l-transfer-footer">
            <span class="private-key">your private key</span>
            <span class="session-address">your address</span>
        </div>

        <div class="logout, l-logout"> 
          <span class="logout"> log out</span>
        </div>
    </div>
      
    `;

  document.querySelector(".logout")?.addEventListener("click", logout);

  const head_currentTabLabel = document.getElementById("current-tab-label")!;
  const div_currentTab = <HTMLDivElement>(
    document.getElementById("current-tab")!
  );
  document.getElementById("balanceTab")?.addEventListener("click", async () => {
    await setBalanceTab(div_currentTab, head_currentTabLabel);
    document.querySelector("#balanceTab")?.classList.add("selected-tab");
    document.querySelector("#transferTab")?.classList.remove("selected-tab");
    document.querySelector("#mintTab")?.classList.remove("selected-tab");
  });
  document
    .getElementById("transferTab")
    ?.addEventListener("click", async () => {
      await setTransferTab(div_currentTab, head_currentTabLabel);
      document.querySelector("#transferTab")?.classList.add("selected-tab");
      document.querySelector("#balanceTab")?.classList.remove("selected-tab");
      document.querySelector("#mintTab")?.classList.remove("selected-tab");
    });
  document.getElementById("mintTab")?.addEventListener("click", async () => {
    await setMintTab(div_currentTab, head_currentTabLabel);
    document.querySelector("#mintTab")?.classList.add("selected-tab");
    document.querySelector("#balanceTab")?.classList.remove("selected-tab");
    document.querySelector("#transferTab")?.classList.remove("selected-tab");
  });
  current = "";
  await setBalanceTab(div_currentTab, head_currentTabLabel);

  const btn_privateKey =
    document.querySelector<HTMLButtonElement>(".private-key")!;
  btn_privateKey.addEventListener("click", () => alert(privateKey));

  const btn_sessionAddress =
    document.querySelector<HTMLButtonElement>(".session-address")!;
  btn_sessionAddress.addEventListener("click", () => alert(session!.address));

  // Event listener for going back one page

  const btn_return = document.querySelector<HTMLButtonElement>(
    ".transfer-window-container .goback-button"
  )!;
  btn_return.addEventListener("click", () => {
    widget(div_dashboard);
  });

  const logo_return =
    document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => {
    widget(div_dashboard);
  });
}

/**
 * set the given tab and label to balance
 * @param div_tab tab to set
 * @param head_tabLabel label to set
 */
async function setBalanceTab(
  div_tab: HTMLDivElement,
  head_tabLabel: HTMLElement
) {
  if (current == "Balance of") {
    return;
  }
  const windowContainer = div_dashboard.querySelector<HTMLDivElement>(
    ".l-transfer-window-container"
  )!;
  windowContainer.style.height = "600px";

  current = "Balance of";
  head_tabLabel.innerHTML = current;
  div_tab.setAttribute("class", "");
  div_tab.style.height = "345px";
  await htmlBalance(div_tab, session!.address.toString(), session);
}

/**
 * set the given tab and label to transfer
 * @param div_tab tab to set
 * @param head_tabLabel label to set
 */
async function setTransferTab(
  div_tab: HTMLDivElement,
  head_tabLabel: HTMLElement
) {
  if (current == "Transfer") {
    return;
  }
  const windowContainer = div_dashboard.querySelector<HTMLDivElement>(
    ".l-transfer-window-container"
  )!;
  windowContainer.style.height = "730px";
  current = "Transfer";
  head_tabLabel.innerHTML = current;
  div_tab.setAttribute(
    "class",
    "transfer-window l-transfer-window second-layer-window"
  );
  await htmlTransfer(div_tab, session);
}

/**
 * set the given tab and label to mint
 * @param div_tab tab to set
 * @param head_tabLabel label to set
 */
async function setMintTab(div_tab: HTMLDivElement, head_tabLabel: HTMLElement) {
  if (current == "Mint") {
    return;
  }
  const windowContainer = div_dashboard.querySelector<HTMLDivElement>(
    ".l-transfer-window-container"
  )!;

  windowContainer.style.height = "700px";

  current = "Mint";
  head_tabLabel.innerHTML = current;
  div_tab.setAttribute(
    "class",
    "mint-window l-mint-window second-layer-window"
  );
  div_tab.style.height = "430px";
  await htmlMint(div_tab, session);
}
