import { goToBalance } from "./balance";
import { htmlCreateSessionForTransfer } from "./transfer";

export function start() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div>
        <div>   
            <button id = "mainButton">
            <img src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" />
            </button>
        </div>
  
        <div class="widget_body" id="widgetBodyMain">
            <header class="widget__header">
                <h3> Welcome to ErdPay</h3>
            
            </header>
            <form>
                <button id="transfer">Transfer</button>
                <button id="account">View Account Balance</button>
                <button id="close">Close</button>
            </form>
        
        </div>
    </div>
`;

    const btn = document.querySelector('#mainButton');
    btn?.addEventListener('click', () => {
        const list = document.querySelector('.widget_body')?.classList;
        list?.add('open');
    });

    const btn2 = document.querySelector('#close');
    btn2?.addEventListener('click', () => {
        const list = document.querySelector('.widget_body')?.classList;
        list?.remove('open');
    });

    const btn3 = document.querySelector('#transfer');
    btn3?.addEventListener('click', () => {
        htmlCreateSessionForTransfer(document.querySelector<HTMLDivElement>('#widgetBodyMain')!)
    });

    const btn4 = document.querySelector('#balance')
    btn4?.addEventListener('click', () => {
        goToBalance(document.querySelector<HTMLDivElement>('#app')!)
    })
}

start()



















