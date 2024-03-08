import { widget } from "./widget";
import { newSession } from "./setup_session";
import { restoreSession } from "./setup_session";
import { Session } from "@polycrypt/erdstall";
import { htmlTransfer } from "./transfer.ts";
import { htmlMint } from "./mint.ts";
import * as utils from "./utils.ts";

let div_dashboard: HTMLDivElement;
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
          <span id="errNewAccount"></span>
          <button type="button" class="new-session-btn" id="newAccount">New Account</button>
          <span>or</span>
          <span id="errRestoreSession"></span>
          <input type="password" placeholder="your private key (ex. 0x1234...)" id="inputPrivateKey"/>
          <button type="button" class="restore-session-btn" >Log-in</button>
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

  btn_newSession.addEventListener("click", () => eventNewSession(div_widget));

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

  btn_restoreSession.addEventListener("click", () =>
    eventRestoreSession(txt_previousPrivateKey.value)
  );
}

/**
 * Function for new session event.
 */
async function eventNewSession(html_widget:HTMLDivElement) {
  const newSession_ = await newSession();
  if (newSession_.message != undefined) {
    utils.displayErrorMessage(newSession_.message,'errNewAccount','newAccount'); 

    return;
  }
  session = newSession_.session!;
  privateKey = newSession_.privateKey!;
  welcome(session, privateKey, html_widget);
}

function welcome(session: Session, privateKey:string, html_widget: HTMLDivElement) {
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


          <div class="copy-icon-session third-layer-window">
             <span class="session-address">${utils.shortenString(sessionAsString,3)}</span>
             <i class="fa-solid fa-copy copy-button"></i>
          </div>

        </div>

        <div class="l-create-account-private-key-container create-account-private-key-container"> 
          <div class="create-account-window-frame-icons">
            <i class="fa-solid fa-key"></i> 
            <p> Your private key </p>
          </div>

          <div class="copy-icon-private-key third-layer-window">
             <span class="private-key">${utils.shortenString(privateKey,3)}</span>
             <i class="fa-solid fa-copy copy-button"></i>
          </div>
        </div>
        
      </div>
      <button type="button" class="transfer-btn"> Go to Dashboard </button>
    </div>
  `
  const copy_button_privatekey = document.querySelector<HTMLElement>(".copy-icon-private-key .fa-copy")!
  utils.copyToClipboard(privateKey,copy_button_privatekey);
  
  const copy_button_session = document.querySelector<HTMLElement>(".copy-icon-session .fa-copy")!
  utils.copyToClipboard(sessionAsString,copy_button_session);

  const dashboard = html_widget.querySelector<HTMLButtonElement>('.l-create-account-window-container .transfer-btn')!;
  dashboard.addEventListener("click", () => htmlDashboard());

}

async function eventRestoreSession(privateKey: string) {
  const restoredSession = await restoreSession(privateKey);
  const valid = utils.checkPrivateKey(
    privateKey,
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
  htmlDashboard();
}

/**
 * Function to make window for transfer and minting.
 */

export function htmlDashboard() {
  div_dashboard.innerHTML = `
    <div class="transfer-window-container l-transfer-window-container first-layer-window">
  
        <div class="widget-header">
            <button class="goback-button">
              <i class="fa-solid fa-angle-left"></i>
            </button>
            <div id="transferTab">Transfer</div>
            <div id="mintTab">Mint</div>
            <img
              class="erdstall-logo"
              src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
              alt="TypeScript"
            />
        </div>
  
        <h1 id="current tab label" class="l-transfer-title">Transfer</h1>
  
        <div id="current tab">
        </div>

        <div class="transfer-footer l-transfer-footer">
            <span class="private-key">your private key</span>
            <span class="session-address">your address</span>
        </div>
    </div>
      
    `;
  const head_currentTabLabel = document.getElementById("current tab label")!;
  const div_currentTab = <HTMLDivElement>(
    document.getElementById("current tab")!
  );
  document
    .getElementById("transferTab")
    ?.addEventListener("click", () =>
      setTransferTab(div_currentTab, head_currentTabLabel)
    );
  document
    .getElementById("mintTab")
    ?.addEventListener("click", () =>
      setMintTab(div_currentTab, head_currentTabLabel)
    );
  current = "";
  setTransferTab(div_currentTab, head_currentTabLabel);

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
    htmlCreateSession(div_dashboard);
  });

  const logo_return =
    document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => {
    widget(div_dashboard);
  });
}

/**
 * set the given tab and label to transfer
 * @param div_tab tab to set
 * @param head_tabLabel label to set
 */
function setTransferTab(div_tab: HTMLDivElement, head_tabLabel: HTMLElement) {
  if (current == "Transfer") {
    return;
  }
  current = "Transfer";
  head_tabLabel.innerHTML = current;
  div_tab.setAttribute(
    "class",
    "transfer-window l-transfer-window second-layer-window"
  );
  htmlTransfer(div_tab, session);
}

/**
 * set the given tab and label to mint
 * @param div_tab tab to set
 * @param head_tabLabel label to set
 */
function setMintTab(div_tab: HTMLDivElement, head_tabLabel: HTMLElement) {
  if (current == "Mint") {
    return;
  }
  current = "Mint";
  head_tabLabel.innerHTML = current;
  div_tab.setAttribute(
    "class",
    "mint-window l-mint-window second-layer-window"
  );
  htmlMint(div_tab, session);
}
