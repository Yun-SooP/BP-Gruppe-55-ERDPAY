import './style.css'
import { Session } from "@polycrypt/erdstall";
import { Address } from '@polycrypt/erdstall/ledger';
import { Account } from '@polycrypt/erdstall/ledger';
import { Asset } from '@polycrypt/erdstall/ledger/assets';
import { Assets } from '@polycrypt/erdstall/ledger/assets';
import { newSession, restoreSession } from './setup_session.ts'
import { mint } from './mint.ts';
import { Tokens } from '@polycrypt/erdstall/ledger/assets';



let session: Session;
let privateKey: string;
let account : Account;
let apphtml : HTMLElement


export function htmlCreateSessionForTransfer(html : HTMLElement){
  apphtml = html
  html.innerHTML = `
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
    let newSession_
    try {
      newSession_ = await newSession()
    } catch(err) {
      alert(err)
      return
    }
    session = newSession_!.session
    privateKey = newSession_!.privateKey
    htmlTransfer()
  })
  b_restoreSession.addEventListener('click', async () => {
    privateKey = privateKey_previous.value
    let restoredSession
    try {
      restoredSession = await restoreSession(privateKey)
    } catch(err) {
      alert(err)
      return
    }
    session = restoredSession!
    htmlTransfer()
  })
}


async function htmlTransfer(){
  account = await session!.getAccount(session!.address)

  document.querySelector<HTMLDivElement>('#transfer')!.innerHTML = `
      <button id="return" type="button">return</button>
      <button id="privatekey" type="button">Your private key</button>
      <div id ="select_token">
      </div>
      <br>
      <div id ="transfer_info">
        <form>
          Transfer to: <input type = "text" id = "address_recipient" placeholder="Type in the recipient address"/><br>
          <button id="makeTransfer" type="button">make transfer</button>
        </form>
      </div>
      <br>
      <div id ="minting">
        <form>
          token address: <input type = "text" id = "token_address" placeholder="Type in the token address"/>
          token id: <input type = "text" id = "token_id" placeholder="Type in the token id"/><br>
          <button id="mint" type="button">mint new token</button>
        </form>
      </div>
  `
  

  const b_privateKey = document.querySelector<HTMLButtonElement>('#privatekey')!
  b_privateKey.addEventListener('click', () => alert(privateKey))

  const b_return = document.querySelector<HTMLButtonElement>('#return')!
  b_return.addEventListener('click', () => htmlCreateSessionForTransfer(apphtml))

  const address_recipient = document.querySelector<HTMLInputElement>('#address_recipient')!;
  const b_makeTransfer = document.querySelector<HTMLButtonElement>('#makeTransfer')!
  
  const b_mint = document.querySelector<HTMLButtonElement>('#mint')!


  if (account.values.values.size == 0){
    document.querySelector<HTMLDivElement>('#select_token')!.innerHTML = `
      You have no token available.
    `
    address_recipient.disabled = true
    b_makeTransfer.disabled = true
  } else{
    document.querySelector<HTMLDivElement>('#select_token')!.innerHTML = `
      Available tokens (token address):
      <select id="token_transfer" size = "5">
      </select>
      amount: <input type = "text" id = "amount" placeholder="amount of tokens to transfer"/>
    `
    const select = document.querySelector<HTMLSelectElement>('#token_transfer')!
    const tokens = Array.from(account.values.values.entries())
    const amount = document.querySelector<HTMLInputElement>('#amount')!;
    for (let i = 0; i < tokens.length; i++){
      const option = document.createElement("option")
      let token = tokens[i]
      option.value = token[0]
      option.text = token[0] + ' (amount: ' + (<Tokens>token[1]).value.length + ')'
      select.add(option)
    }

    b_makeTransfer.addEventListener('click', async () => {
      const { status, error } = await transferTo(session, select.value, parseInt(amount.value), address_recipient.value)
      if (status == 0) {
        alert("transfer failed!: " + error)
      } else if (status == 1) {
        alert("transfer succesful!")
      }
      await htmlTransfer()
    })

  }
  
  b_mint.addEventListener('click', async ()=>{
    const token_address = document.querySelector<HTMLInputElement>('#token_address')!
    const token_id = document.querySelector<HTMLInputElement>('#token_id')!
    const { status , error } = await mint(session, token_address.value, parseInt(token_id.value))
    if (status == 0) {
      alert("minting failed!: " + error)
    } else if (status == 1){
      alert("token succesfully minted!")
    }
    await htmlTransfer()
  })
}


async function transferTo(session: Session, token: string, amount: number, address: string) {
    let tokens = <Tokens>account.values.values.get(token)!
    tokens.value = tokens.value.slice(0, amount)
    const asset = <Asset>tokens
    let assets_transfer = new Assets({ token: token, asset: asset })
    let transaction
    let receipt
    let status
    let error
    try {
      transaction = await session.transferTo(assets_transfer, Address.fromString(address))
      receipt = await transaction.receipt
      status = receipt.status
      error = receipt.error
    } catch (err) {
      status = 0
      error = err
    }
    return { status, error}

}
