import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
import * as utils from "./utils.ts";

//let session: Session;
let div_mint: HTMLDivElement;

/**
 * Function to display the functionality of minting.
 * @param div_mint HTML to display to
 * @param session The session in which the token will minted in.
 */
export async function htmlMint(div: HTMLDivElement, session: Session) {
  div_mint = div;
  //session = sessionForMint;

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
  const txt_tokenAddress = document.querySelector<HTMLInputElement>(
    ".mint-form input[placeholder='token address (ex. 0x1234...)']"
  )!;

  const txt_tokenID = document.querySelector<HTMLInputElement>(
    ".mint-form input[placeholder='token ID']"
  )!;

  const chk_multiple = document.querySelector<HTMLInputElement>("#multiple")!;
  chk_multiple.addEventListener(
    "click",
    () =>
      (txt_tokenID.placeholder = chk_multiple.checked ? "amount" : "token ID")
  );

  const btn_mint = document.querySelector<HTMLButtonElement>(
    ".mint-form .mint-btn"
  )!;
  btn_mint.addEventListener("click", async () =>
    chk_multiple.checked ? eventMultipleMint(session) : eventSingleMint(session)
  );

  const btn_randomAddress = document.querySelector<HTMLInputElement>(
    ".mint-form .random-address-btn"
  )!;
  btn_randomAddress.addEventListener(
    "click",
    () => (txt_tokenAddress.value = utils.generateRandomAddress())
  );
}

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
  
  if (!valid) {
    return;
  }
  const { status, error } = await mint(
    session,
    tokenAddress,
    BigInt(parseFloat(tokenID))
  );
  if (status == 0) {
    const err: Error = <Error>error;
    alert("Minting failed: " + err.message);
    return;
  } else if (status == 1) {
    htmlMintSuccessful(session);
    //alert("Token succesfully minted!");
  }
  //await htmlMint(div_mint, session);
}

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
  await multipleMint(session, tokenAddress, parseFloat(amount));
  htmlMintSuccessful(session);
  //alert("Tokens succesfully minted!");
  //await htmlMint(div_mint, session);
}

//split into checking address and checking other inputs, or even into 3.
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
 * Function to mint a token.
 * @param session The session in which the token will minted in.
 * @param token Token address to mint of.
 * @param id Token ID to mint. Has to be non existing ID.
 * @returns Status and error message
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

async function multipleMint(
  session: Session,
  tokenAddress: string,
  amount: number
): Promise<bigint[]> {
  const tokenIDs: bigint[] = [];
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
    }
    tokenIDs.push(tokenID!);
  }
  return tokenIDs;
}

/**
 * Function to display successful transfer.
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
