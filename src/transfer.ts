import './style.css'
import { Session } from "@polycrypt/erdstall";
import { Address } from '@polycrypt/erdstall/ledger';
import { Account } from '@polycrypt/erdstall/ledger';
import { Assets, decodePackedAssets } from '@polycrypt/erdstall/ledger/assets';
import { newSession, restoreSession } from './setup_session.ts'
import { mint } from './mint.ts';



let session: Session;
let privateKey: string;
let account : Account;

htmlCreateSessionForTransfer()

function htmlCreateSessionForTransfer(){

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Transfer</h1>
    <div id= "transfer" class="card">
      <p>Create a new session or retore your previous session with your private key.</p>
      <div>
        <button id="newSession" type="button">new session</button>
      </div>
      <br>
      <div>
        <form>
          <input type = "text" id = "privateKey" placeholder="Type in your private key"/><br>
          <button id="restoreSession" type="button">restore session</button>
        </form>
      </div>
    </div>
  </div>
  `
  const b_newSession = document.querySelector<HTMLButtonElement>('#newSession')!
  const b_restoreSession = document.querySelector<HTMLButtonElement>('#restoreSession')!
  var privateKey_previous = document.querySelector<HTMLInputElement>('#privateKey')!;


  b_newSession.addEventListener('click', async () => {
    let newSession_ = await newSession()
    session = newSession_.session
    privateKey = newSession_.privateKey
    console.log(session.address.toString())
    htmlTransfer()
  })
  b_restoreSession.addEventListener('click', async () => {
    privateKey = privateKey_previous.value
    session = await restoreSession(privateKey)
    htmlTransfer()
  })
}


async function htmlTransfer(){
  document.querySelector<HTMLDivElement>('#transfer')!.innerHTML = `
      <button id="privatekey" type="button"></button>
      <div id ="select_token">
      </div>
      <div id ="transfer_info">
        <form>
          Transfer to: <input type = "text" id = "address_recipient" placeholder="Type in the recipient address"/>
          <button id="makeTransfer" type="button"></button>
        </form>
      </div>
  `
  account = await session!.getAccount(session!.address)
  const button_privateKey = document.querySelector<HTMLButtonElement>('#privatekey')!
  button_privateKey.innerHTML = `Your private key`
  button_privateKey.addEventListener('click', () => alert(privateKey))

  var address_recipient = document.querySelector<HTMLInputElement>('#address_recipient')!;

  const makeTransfer = document.querySelector<HTMLButtonElement>('#makeTransfer')!
  makeTransfer.innerText = 'make transfer'

  if (account.values.values.size == 0){
    document.querySelector<HTMLDivElement>('#select_token')!.innerHTML = `
      You have no token available.
    `
    address_recipient.disabled = true
    makeTransfer.disabled = true
  } else{
    document.querySelector<HTMLDivElement>('#select_token')!.innerHTML = `
      <select name="token_transfer" size = "5">
      </select>
    `
    let option = document.createElement("option")
    option.text="Token1"
    let select = document.querySelector<HTMLSelectElement>('#token_transfer')!
  }
  

  makeTransfer.addEventListener('click', () => {
    transferWithMint(session, address_recipient.value)
  })
}
let assets = null
let minting_id = 0

async function transferWithMint(session: Session, address: string) {
  await mint(session, "0x923439be515b6a928cb9650d70000a9044e49e84", minting_id)
  let asset = account.values.values.get("0x923439be515b6a928cb9650d70000a9044e49e84")!
  console.log(asset)
  asset.value = [BigInt(0), BigInt(53)]
  
  console.log(asset.value)

  let assets_transfer = new Assets({ token: "0x923439be515b6a928cb9650d70000a9044e49e84", asset: asset })
  await transferTo(session, assets_transfer, address)
}

function transferTo(session: Session, assets: Assets, address: string) {
    return session.transferTo(assets, Address.fromString(address))
}
