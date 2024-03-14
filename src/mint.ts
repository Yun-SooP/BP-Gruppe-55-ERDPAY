import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
import * as utils from "./utils.ts";
import {div_dashboard} from "./dashboard.ts"

//let session: Session;
let div_mint: HTMLDivElement;

/**
 * Sets up the minting interface, allowing users to input data for minting new tokens.
 * It provides input fields for token address and token ID, and buttons for minting and generating a random address.
 *
 * @param div The HTMLDivElement where the minting interface will be displayed.
 * @param session The session in which the token will be minted.
 */
export async function htmlMint(div: HTMLDivElement, session: Session) {
  // Assign the provided div element to a global variable for future manipulation
  div_mint = div;

  // Set the inner HTML of the div element to create the minting form
  div_mint.innerHTML = `
    <form class="mint-form">

        <span id="errMintTokenAddr"></span>
        <input type="text" class="token-address-txt" placeholder="token address (ex. 0x1234...)" id="mintTokenAddr"/>
        <button type="button" class="random-address-btn">generate random address</button>

        <div class="mint-form__multiple-tokens">
          <label class="toggle">
            <input type="checkbox" id="multiple"></checkbox>
            <span class="slider round"></span>
          </label>
          <p>mint multiple tokens</p>
        </div> 

        <span id="errMintTokenId"></span>
        <input type="text" placeholder="token ID" id="mintTokenId"/>
        <button type="button" class="mint-btn">mint new token</button>
    </form>
    `;

  // Select the token address input field
  const txt_tokenAddress = document.querySelector<HTMLInputElement>(
    ".mint-form input[placeholder='token address (ex. 0x1234...)']"
  )!;

  // Select the token ID input field
  const txt_tokenID = document.querySelector<HTMLInputElement>(
    ".mint-form input[placeholder='token ID']"
  )!;

  // Select the checkbox for minting multiple tokens and set up an event listener to change the token ID input's placeholder
  const chk_multiple = document.querySelector<HTMLInputElement>("#multiple")!;
  chk_multiple.addEventListener(
    "click",
    () =>
      (txt_tokenID.placeholder = chk_multiple.checked ? "amount" : "token ID")
  );

  // Select the mint button and attach an event listener for minting tokens
  const btn_mint = document.querySelector<HTMLButtonElement>(
    ".mint-form .mint-btn"
  )!;
  btn_mint.addEventListener("click", async () => {
    // Determine whether to perform single or multiple minting based on the checkbox state
    chk_multiple.checked ? eventMultipleMint(session) : eventSingleMint(session)
  }
  );

  // Select the button for generating a random token address and set up an event listener to populate the address
  const btn_randomAddress = document.querySelector<HTMLInputElement>(
    ".mint-form .random-address-btn"
  )!;
  btn_randomAddress.addEventListener(
    "click",
    () => (txt_tokenAddress.value = utils.generateRandomAddress())
  );
}

/**
 * Handles the minting of a single token by capturing user inputs for token address and token ID,
 * validating them, and then calling the mint function. If minting is successful, it shows a success message;
 * otherwise, it alerts the user of the failure.
 *
 * @param session The session in which the token will be minted.
 * @returns If minting fails, the function simply returns without proceeding further.
 */
async function eventSingleMint(session: Session) {
  const txt_tokenAddress = document.querySelector<HTMLInputElement>(
    ".mint-form input[placeholder='token address (ex. 0x1234...)']"
  )!;
  const txt_tokenID = document.querySelector<HTMLInputElement>(
    ".mint-form input[placeholder='token ID']"
  )!;
  const tokenAddress = txt_tokenAddress.value;
  const tokenID = txt_tokenID.value;

  //cannot differenciate if error is for token address or amount
  const valid = checkInputsForMint(tokenAddress, "1", tokenID);
  
  // If validation fails, return early
  if (!valid) {
    return;
  }

  // Attempt to mint the token with the provided address and ID
  const { status, error } = await mint(
    session,
    tokenAddress,
    BigInt(parseFloat(tokenID))
  );

  // Check the status of the minting operation and alert the user accordingly
  if (status == 0) {
    // If minting failed, display an error message
    const err: Error = <Error>error;
    alert("Minting failed: " + err.message);
    return;
  } else if (status == 1) {
    // If minting succeeded, display the success interface
    htmlMintSuccessful(session);
  }
}

/**
 * Handles the minting of multiple tokens by capturing user inputs for token address and the amount
 * of tokens to mint, validating them, and then calling the multipleMint function. If minting is successful,
 * it shows a success message; otherwise, it alerts the user of the failure.
 *
 * @param session The session in which the tokens will be minted.
 * @returns If minting fails, the function simply returns without proceeding further.
 */
async function eventMultipleMint(session: Session) {
  const txt_tokenAddress = document.querySelector<HTMLInputElement>(
    ".mint-form input[placeholder='token address (ex. 0x1234...)']"
  )!;
  const txt_amount = document.querySelector<HTMLInputElement>(
    ".mint-form input[placeholder='amount']"
  )!;
  const tokenAddress = txt_tokenAddress.value;
  const amount = txt_amount.value;
  const valid = checkInputsForMint(tokenAddress, amount);
  if (!valid) {
    return;
  }

  // Start the loading animation during the minting process
  utils.loadingStart(div_dashboard);

  // Select the counter div where minting progress will be displayed
  const div_counter = document.querySelector<HTMLDivElement>("#token-counter")!;

  // Attempt to mint the specified amount of tokens
  await multipleMint(session, tokenAddress, parseFloat(amount), div_counter);
  
  // End the loading animation once minting is complete
  utils.loadingEnd(div_dashboard);

  // Show the minting success interface
  htmlMintSuccessful(session);
}

/**
 * Validates the inputs for minting. It checks if the token address and amount are valid.
 * Optionally, if a token ID is provided, it validates that as well.
 *
 * @param tokenAddress The address of the token to mint.
 * @param amount The amount of tokens to mint.
 * @param tokenID Optionally, the ID of the token to mint.
 * @returns A boolean indicating whether the inputs are valid.
 */
function checkInputsForMint(
  tokenAddress: string,
  amount: string,
  tokenID?: string
): boolean {
  let valid = true
  valid = !utils.checkTokenAddress(tokenAddress, 'errMintTokenAddr', 'mintTokenAddr') ? false : valid;
  valid = !utils.checkAmount(amount, 'errMintTokenId', 'mintTokenId') ? false : valid;
  if (tokenID != undefined) {
    valid = !utils.checkTokenID(tokenID, 'errMintTokenId', 'mintTokenId') ? false : valid;
  }
  return valid;
}

/**
 * Updates the HTML content to display a message indicating a successful minting operation.
 * It also provides a button to return to the minting interface.
 *
 * @param session The session that will be used for returning to the minting interface.
 */
function htmlMintSuccessful(session:Session) {
  div_mint.innerHTML = `
    <div class="successful-div third-layer-window">Mint Successful!</div>
    <form class="successful-form">
      <button type="button" class="return-btn">return</button>
    </form>
  `;
  const btn_return = document.querySelector<HTMLInputElement>(
    ".successful-form .return-btn"
  )!;
  btn_return.addEventListener("click", () =>
    htmlMint(div_mint, session)
  );
}

/**
 * Mints a new token with the specified address and ID in the given session.
 * Handles the mint transaction and interprets the receipt to return the status and any error messages.
 *
 * @param session The session in which the token will be minted.
 * @param tokenAddress The token address for the token to be minted.
 * @param tokenID The token ID for the token to be minted. It must be a unique ID.
 * @returns An object containing the status of the mint operation and any error message.
 */
async function mint(session: Session, tokenAddress: string, tokenID: bigint) {
  let transaction;
  let receipt;
  let status;
  let error;
  try {
    transaction = await session.mint(Address.fromString(tokenAddress), tokenID);
    receipt = await transaction.receipt;
    status = receipt.status;
    error = receipt.error;
    if (error == "processing *tee.MintTX: duplicate mint [nonce increased]") {
      error = new Error(
        "There is a duplicate token to the given token address and token ID. Please try again with a different token address or ID."
      );
    }
  } catch (err) {
    status = 0;
    error = err;
    if (
      error?.toString().includes("invalid arrayify value") ||
      error?.toString().includes("hex data is odd-length")
    ) {
      error = new Error("Please enter a valid token address.");
    }
  }

  return { status, error };
}

/**
 * Mints multiple tokens with the given token address for the specified amount.
 * It keeps track of the minting progress and updates the counter on the page.
 *
 * @param session The session to use for minting.
 * @param tokenAddress The address of the token contract where tokens will be minted.
 * @param amount The number of tokens to mint.
 * @param div_counter The HTMLDivElement that displays the minting progress counter.
 * @returns A promise that resolves to an array of minted token IDs.
 */
async function multipleMint(
  session: Session,
  tokenAddress: string,
  amount: number,
  div_counter:HTMLDivElement
): Promise<bigint[]> {
  const tokenIDs: bigint[] = [];
  div_counter.innerText = `0/${amount}`;

  for (let i = 0; i < amount; i++) {
    let status = 0;
    let tokenID;
    while (status == 0) {
      const transaction = await mint(
        session,
        tokenAddress,
        utils.generateRandomTokenID()
      );
      status = <number>transaction.status;
      div_counter.innerText = `${i}/${amount}`;
    }
    tokenIDs.push(tokenID!);
  }
  return tokenIDs;
}

