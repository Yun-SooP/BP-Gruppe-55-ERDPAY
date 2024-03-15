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
 * Renders the user interface for session creation or restoration.
 * It provides options for the user to either create a new account or log in with an existing private key.
 *
 * @param div_widget The HTMLDivElement where the session creation or restoration interface will be displayed.
 */
export function htmlCreateSession(div_widget: HTMLDivElement) {
  // Store the div_widget into div_dashboard for later use
  div_dashboard = div_widget;

  // Set the HTML content of div_dashboard with session options
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
              Log-in with your private key or
              <br/>
              Create a new account  
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

  // Select the "New Account" button and attach the event for creating a new session
  const btn_newSession = document.querySelector<HTMLButtonElement>(
    ".session-window__form .new-session-btn"
  )!;
  btn_newSession.addEventListener(
    "click",
    async () => await eventNewSession(div_widget)
  );

  // Select the "Log-in" button and attach the event for restoring a session with a private key
  const btn_restoreSession = document.querySelector<HTMLButtonElement>(
    ".session-window__form .restore-session-btn"
  )!;
  btn_restoreSession.addEventListener(
    "click",
    async () => await eventRestoreSession(txt_previousPrivateKey.value)
  );

  // Select the private key input field and set up an event listener for the "Enter" key
  const txt_previousPrivateKey = document.querySelector<HTMLInputElement>(
    ".session-window__form input[type='password']"
  )!;
  txt_previousPrivateKey.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      btn_restoreSession.click();
    }
  });

  // Select and set up event listeners for logo and back button to navigate back to the previous widget view
  const logo_return =
    document.querySelector<HTMLButtonElement>(".erdstall-logo")!;
  logo_return.addEventListener("click", () => widget(div_dashboard));

  const btn_return = document.querySelector<HTMLButtonElement>(
    ".session-window .goback-button"
  )!;
  btn_return.addEventListener("click", () => widget(div_dashboard));
}

/**
 * Initiates the creation of a new session and updates the interface accordingly.
 * If successful, it establishes a new session and private key, performs a login,
 * and proceeds to account creation within the provided HTML widget.
 *
 * @param html_widget The HTMLDivElement where the new account interface and information will be displayed.
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
        <h1> Your account was created successfully! </h1>
        <p> Here is your account information. <br> Please do not share your private-key data with anyone else. </p>
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
  utils.setCopyToClipboardListener(privateKey, copy_button_privatekey);

  const copy_button_session = document.querySelector<HTMLElement>(
    ".copy-icon-session .fa-copy"
  )!;
  utils.setCopyToClipboardListener(sessionAsString, copy_button_session);

  const dashboard = html_widget.querySelector<HTMLButtonElement>(
    ".l-create-account-window-container .transfer-btn"
  )!;
  dashboard.addEventListener(
    "click",
    async () => await htmlDashboard(div_dashboard, session, privateKey)
  );
}

/**
 * Handles the event to restore a user session using a provided private key.
 * It attempts to restore the session, validates the private key, displays error messages if any,
 * and updates the UI with the restored session details if successful.
 *
 * @param privateKeyForRestore The private key string used to attempt session restoration.
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
 * Dynamically generates and updates the dashboard HTML content for transfer and minting operations.
 * It sets up the interactive tabs for balance, transfer, and mint actions, and binds relevant event handlers.
 *
 * @param div_dashboard - The container div element where the dashboard will be rendered.
 * @param session - The current user's session.
 * @param privateKey - The private key of the account.
 */
export async function htmlDashboard(
  div_dashboard: HTMLDivElement,
  session: Session,
  privateKey: string
) {
  // Set up the initial HTML structure for the dashboard.
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

  // Add a click event listener to the logout element.
  document.querySelector(".logout")?.addEventListener("click", logout);

  // Acquire references to DOM elements that will be dynamically updated.
  const head_currentTabLabel = document.getElementById("current-tab-label")!;
  const div_currentTab = <HTMLDivElement>(
    document.getElementById("current-tab")!
  );

  // Tab event listeners for switching between balance, transfer, and mint views.
  // Each tab click updates the view and highlights the selected tab.
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

  // Initially set the dashboard to display the balance tab by default.
  current = "";
  await setBalanceTab(div_currentTab, head_currentTabLabel);

  // Add event listeners to private key and session address elements to show alerts with the info on click.
  const btn_privateKey =
    document.querySelector<HTMLButtonElement>(".private-key")!;
  btn_privateKey.addEventListener("click", () => alert(privateKey));

  const btn_sessionAddress =
    document.querySelector<HTMLButtonElement>(".session-address")!;
  btn_sessionAddress.addEventListener("click", () => alert(session!.address));

  // Event listeners for additional UI elements like the go back button and logo to perform navigation.
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
 * Updates the dashboard to display the balance tab. Adjusts the user interface elements to show the user's balance,
 * sets the header label to indicate the balance tab is active, and loads the balance data into the tab content area.
 *
 * @param div_tab The HTMLDivElement that will be updated with the balance content.
 * @param head_tabLabel The HTMLElement that serves as the header label for the tab, to be set to "Balance".
 */
async function setBalanceTab(
  div_tab: HTMLDivElement,
  head_tabLabel: HTMLElement
) {
  if (current == "My Balance") {
    return;
  }
  const windowContainer = div_dashboard.querySelector<HTMLDivElement>(
    ".l-transfer-window-container"
  )!;
  windowContainer.style.height = "760px";

  current = "My Balance";
  head_tabLabel.innerHTML = current;
  div_tab.setAttribute("class", "");
  div_tab.style.height = "110px";
  await htmlBalance(div_tab, session!.address.toString(), session);
}

/**
 * Changes the dashboard view to the mint tab. Alters the UI to accommodate the minting features,
 * sets the header label to show the mint tab is selected, and loads the minting interface into the tab content.
 *
 * @param div_tab The HTMLDivElement that will be updated with the mint content.
 * @param head_tabLabel The HTMLElement that acts as the header label for the tab, to be set to "Mint".
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
  windowContainer.style.height = "600px";
  current = "Transfer";
  head_tabLabel.innerHTML = current;
  div_tab.setAttribute(
    "class",
    "transfer-window l-transfer-window second-layer-window"
  );
  div_tab.style.height = "110px";
  await htmlTransfer(div_tab, session);
}

/**
 * Activates the mint tab on the dashboard, updating the display to show minting options.
 * This function changes the current visual state to the mint interface, modifies the header label to reflect the change,
 * and invokes the minting content load into the provided tab element.
 *
 * @param div_tab The HTMLDivElement to be populated with mint tab content.
 * @param head_tabLabel The HTMLElement that acts as the title label, to be updated to the minting context.
 */
async function setMintTab(div_tab: HTMLDivElement, head_tabLabel: HTMLElement) {
  if (current == "Mint") {
    return;
  }
  const windowContainer = div_dashboard.querySelector<HTMLDivElement>(
    ".l-transfer-window-container"
  )!;

  windowContainer.style.height = "750px";

  current = "Mint";
  head_tabLabel.innerHTML = current;
  div_tab.setAttribute(
    "class",
    "mint-window l-mint-window second-layer-window"
  );
  div_tab.style.height = "470px";
  await htmlMint(div_tab, session);
}
